import * as AuditService from "./auditService";
import {
    ActionType,
    AuditLog,
    AuditResponse,
} from "./auditTypes";

// Logs an audit entry for a specific action and target.
export const logAudit = async (
	actionType: ActionType,
	targetId: string
): Promise<AuditResponse<AuditLog>> => {
	if (!targetId) {
		return { success: false, error: "Target ID is required." };
	}
	if (!actionType) {
		return { success: false, error: "Action type is required." };
	}

	return AuditService.logAudit(actionType, targetId);
};

// Gets all audit history.
export const getHistory = async (): Promise<AuditResponse<AuditLog[]>> => {
	return AuditService.getHistory();
};