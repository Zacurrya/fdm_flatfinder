import { supabase } from "@lib/supabase";
import { getUserEmailMapByIds } from "../db/userLookup";
import { ActionType, AuditLog, AuditResponse } from "./auditTypes";

const AUDIT_TABLE = "AuditLogs";

type Role = "ADMIN" | "CONSULTANT";

function mapAuditRow(row: Record<string, any>): AuditLog {
	return {
		auditId: row.auditId ?? row.audit_id ?? row.id,
		userId: row.userId ?? row.user_id ?? "",
		targetId: row.targetId ?? row.target_id ?? "",
		userEmail: row.userEmail ?? row.user_email ?? undefined,
		targetEmail: row.targetEmail ?? row.target_email ?? undefined,
		actionType: (row.actionType ?? row.action_type) as ActionType,
		timeStamp: row.timeStamp ?? row.timestamp ?? row.created_at ?? new Date().toISOString(),
	};
}

export const logAudit = async (
	userId: string, 
	action: ActionType,
	targetId: string
): Promise<AuditResponse<AuditLog>> => {
  
	const { data, error } = await supabase
		.from(AUDIT_TABLE)
		.insert({ 
            actionType: action, 
            userId: userId, 
            targetId: targetId 
        })
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
		return { success: false, error: "No authenticated user available." };
	}

	const { data: requesterProfile, error: requesterError } = await supabase
		.from("Users")
		.select("role")
		.eq("userId", sessionUserId)
		.single();

	if (requesterError || !requesterProfile) {
		return { success: false, error: "Unable to resolve requester role." };
	}

	const requesterRole = requesterProfile.role as Role;
	let query = supabase.from(AUDIT_TABLE).select("*");

	if (requesterRole === "ADMIN") {
		const trimmedEmail = userEmail?.trim();
		if (trimmedEmail) {
			const { data: selectedUser } = await supabase
				.from("Users")
				.select("userId")
				.ilike("email", trimmedEmail)
				.maybeSingle();

			if (selectedUser?.userId) {
				query = query.or(`userId.eq.${selectedUser.userId},targetId.eq.${selectedUser.userId}`);
			} else if (trimmedEmail) {
				return { success: true, data: [] }; 
			}
		}
	} else {
		query = query.or(`userId.eq.${sessionUserId},targetId.eq.${sessionUserId}`);
	}

	const { data, error } = await query;
	if (error) return { success: false, error: error.message };

	const history = (data ?? [])
		.map((row) => mapAuditRow(row as Record<string, any>))
		.sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime());

	const uniqueUserIds = history
		.flatMap((item) => [item.userId, item.targetId])
		.filter((id): id is string => Boolean(id));

	const userEmailResult = await getUserEmailMapByIds(uniqueUserIds);
	const emailByUserId = userEmailResult.success ? (userEmailResult.data ?? {}) : {};

	const historyWithEmails = history.map((item) => ({
		...item,
		userEmail: emailByUserId[item.userId] ?? "Unknown",
		targetEmail: emailByUserId[item.targetId] ?? "Unknown",
	}));

	return { success: true, data: historyWithEmails };
};
