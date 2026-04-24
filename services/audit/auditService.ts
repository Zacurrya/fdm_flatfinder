import { ActionType } from "@/types/enums";
import { AuditLogEntry } from "@/types/views";
import { supabase } from "@lib/supabase";
import { CreateAuditLogDTO } from "./types";


export const AuditService = {
	/**
	 * Logs an audit entry.
	 * @params userId, targetId: nullable, actionType
	 */
	async logAction(dto: CreateAuditLogDTO) {
		// Inserts audit log into table and returns it
		const { data, error } = await supabase
			.from('audit_logs')
			.insert({
				action_type: dto.actionType as any,
				user_id: dto.userId,
				target_id: dto.targetId
			})
			.select()
			.single();

		if (error || !data) throw new Error(error?.message ?? "Failed to create audit log.");

		return {
			id: data.id,
			userId: data.user_id,
			targetId: data.target_id || null,
			actionType: data.action_type as ActionType,
			createdAt: data.timestamp,
		};
	},

	/**
	 * Fetches all rows from audit_logs, adds user emails, and returns them.
	 */
	async getAudits(): Promise<AuditLogEntry[]> {
		// Fetch all audit rows in descending order
		const { data: rows, error } = await supabase
			.from('audit_logs')
			.select("*")
			.order("timestamp", { ascending: false });

		if (error) { throw error; };
		if (!rows || rows.length === 0) { return []; } // No audits

		// Map rows to AuditLog shape
		const logs: AuditLogEntry[] = rows.map((row) => ({
			id: row.id.toString(),
			userId: row.user_id ?? "",
			targetId: row.target_id ?? "",
			actionType: row.action_type as ActionType,
			createdAt: row.timestamp ?? new Date().toISOString(),
		}));

		// Add user emails, first names and last names
		const allUserIds = [
			...new Set(
				logs
					.flatMap((l) => [l.userId, l.targetId])
					.filter(Boolean)
			),
		];

		if (allUserIds.length > 0) {
			// Fetch user emails and names
			const { data: users, error: userError } = await supabase
				.from("users")
				.select("user_id, email, first_name, last_name")
				.in("user_id", allUserIds);

			if (!userError && users) {
				const userMap = Object.fromEntries(users.map(u => [u.user_id, u]));
				for (const log of logs) {
					const actor = userMap[log.userId];
					const target = userMap[log.targetId];
					log.userEmail = actor?.email ?? "";
					log.userFirstName = actor?.first_name ?? "";
					log.userLastName = actor?.last_name ?? "";
					log.targetEmail = target?.email ?? "";
					log.targetFirstName = target?.first_name ?? "";
					log.targetLastName = target?.last_name ?? "";
				}
			}
		}

		return logs;
	},

};