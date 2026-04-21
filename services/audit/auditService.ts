import { supabase } from "@lib/supabase";
import { getUserEmailMapByIds } from "@services/user/userService";
import { ActionType, AuditLog, AuditResponse } from "./types";

const TABLE = "AuditLogs";


/**
 * Logs an audit entry.
 */

export const logAudit = async (
	action: ActionType,
	targetId: string
): Promise<AuditResponse<AuditLog>> => {
	const { data: sessionData } = await supabase.auth.getSession();
	const userId = sessionData?.session?.user?.id;

	if (!userId) {
		return { success: false, error: "No authenticated user." };
	}

	const { data, error } = await supabase
		.from(TABLE)
		.insert({ actionType: action, userId, targetId })
    .select()
    .single();

	if (error || !data) {
		return { success: false, error: error?.message || "Failed to create audit log." };
	}

	return {
		success: true,
		data: {
			auditId: data.id,
			userId: data.userId,
			targetId: data.targetId,
			actionType: data.actionType as ActionType,
			timeStamp: data.timestamp,
		},
	};
};

/**
 * Fetches ALL rows from AuditLogs, enriches with user emails, and returns them.
 */
export const getHistory = async (): Promise<AuditResponse<AuditLog[]>> => {
	console.log("[AuditService] Fetching all from AuditLogs...");

	// 1. Fetch all audit rows
	const { data: rows, error } = await supabase
		.from(TABLE)
		.select("*")
		.order("timestamp", { ascending: false });

	console.log("[AuditService] Query result:", { rowCount: rows?.length ?? 0, error: error?.message ?? null });

	if (error) {
		console.error("[AuditService] Fetch error:", error);
		return { success: false, error: error.message };
	}

	if (!rows || rows.length === 0) {
		console.log("[AuditService] No rows returned.");
		return { success: true, data: [] };
	}

	console.log("[AuditService] First row sample:", JSON.stringify(rows[0]));

	// 2. Map rows to AuditLog shape
	const logs: AuditLog[] = rows.map((row) => ({
		auditId: row.id,
		userId: row.userId ?? "",
		targetId: row.targetId ?? "",
		actionType: row.actionType as ActionType,
		timeStamp: row.timestamp ?? new Date().toISOString(),
	}));

	// 3. Enrich with user emails
	const allUserIds = [
		...new Set(
			logs
				.flatMap((l) => [l.userId, l.targetId])
				.filter(Boolean)
		),
	];

	console.log("[AuditService] Unique user IDs to resolve:", allUserIds.length);

	if (allUserIds.length > 0) {
		const emailMapResult = await getUserEmailMapByIds(allUserIds);
		const emailMap = emailMapResult.data ?? {};

		for (const log of logs) {
			log.userEmail = emailMap[log.userId] ?? "";
			log.targetEmail = emailMap[log.targetId] ?? "";
		}
	}

	console.log("[AuditService] Returning", logs.length, "audit logs.");
	return { success: true, data: logs };
};