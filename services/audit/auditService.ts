import { supabase } from "@lib/supabase";

type ActionType =
	| "USER_APPROVED"
	| "USER_DENIED"
	| "USER_BANNED"
	| "MESSAGE_DELETED";

type AuditLog = {
	auditId: number | string;
	userId: string;
	targetId: string;
	actionType: ActionType;
	timeStamp: string;
};

type AuditResponse<T = undefined> = {
	success: boolean;
	data?: T;
	error?: string;
};

const AUDIT_TABLE = "AuditLogs";

type Role = "ADMIN" | "CONSULTANT";

function mapAuditRow(row: Record<string, any>): AuditLog {
	return {
		auditId: row.auditId ?? row.audit_id ?? row.id,
		userId: row.userId ?? row.user_id ?? "",
		targetId: row.targetId ?? row.target_id ?? "",
		actionType: (row.actionType ?? row.action_type) as ActionType,
		timeStamp: row.timeStamp ?? row.timestamp ?? row.created_at ?? new Date().toISOString(),
	};
}

export const logAudit = async (
	action: ActionType,
	targetId: string
): Promise<AuditResponse<AuditLog>> => {
	const { data: sessionData } = await supabase.auth.getSession();
	const userId = sessionData?.session?.user?.id;

	if (!userId) {
		return { success: false, error: "No authenticated user available for audit logging." };
	}

	const { data, error } = await supabase
		.from(AUDIT_TABLE)
		.insert({ actionType: action, userId, targetId })
		.select("*")
		.single();

	if (error) {
		return { success: false, error: error.message };
	}

	if (!data) {
		return { success: false, error: "Failed to create audit entry." };
	}

	return { success: true, data: mapAuditRow(data as Record<string, any>) };
};

export const getHistory = async (
	userEmail?: string
): Promise<AuditResponse<AuditLog[]>> => {
	const { data: sessionData } = await supabase.auth.getSession();
	const sessionUserId = sessionData?.session?.user?.id;

	if (!sessionUserId) {
		return { success: false, error: "No authenticated user available for audit history." };
	}

	const { data: requesterProfile, error: requesterError } = await supabase
		.from("Users")
		.select("role")
		.eq("userId", sessionUserId)
		.single();

	if (requesterError || !requesterProfile) {
		return { success: false, error: "Unable to resolve requester role for audit history." };
	}

	const requesterRole = requesterProfile.role as Role;
	let query = supabase
		.from(AUDIT_TABLE)
		.select("*");

	if (requesterRole === "ADMIN") {
		const trimmedEmail = userEmail?.trim();

		if (trimmedEmail) {
			const { data: selectedUser, error: selectedUserError } = await supabase
				.from("Users")
				.select("userId")
				.ilike("email", trimmedEmail)
				.maybeSingle();

			if (selectedUserError) {
				return { success: false, error: selectedUserError.message };
			}

			if (!selectedUser?.userId) {
				return { success: true, data: [] };
			}

			query = query.or(`userId.eq.${selectedUser.userId},targetId.eq.${selectedUser.userId}`);
		}
	} else {
		query = query.or(`userId.eq.${sessionUserId},targetId.eq.${sessionUserId}`);
	}

	const { data, error } = await query;

	if (error) { return { success: false, error: error.message }; }

	const history = (data ?? [])
		.map((row) => mapAuditRow(row as Record<string, any>))
		.sort(
			(a, b) =>
				new Date(b.timeStamp).getTime() -
				new Date(a.timeStamp).getTime()
		);

	return { success: true, data: history };
};