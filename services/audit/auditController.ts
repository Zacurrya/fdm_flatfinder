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

// Gets audit history for a defined user.
export const getHistory = async (
	userEmail?: string
): Promise<AuditResponse<AuditLog[]>> => {
	if (userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) {
		return { success: false, error: "Enter a valid email address." };
	}

	return AuditService.getHistory(userEmail?.trim());
};