import * as AuditService from "./auditService";
import {
    ActionType,
    AuditLog,
    AuditResponse,
} from "./auditTypes";

export const logAudit = async (
	userId: string, 
	actionType: ActionType,
	targetId: string
): Promise<AuditResponse<AuditLog>> => {

	if (!userId) {
		return { success: false, error: "User ID is required." };
	}
	if (!targetId) {
		return { success: false, error: "Target ID is required." };
	}
	if (!actionType) {
		return { success: false, error: "Action type is required." };
	}

	return AuditService.logAudit(userId, actionType, targetId);
};

export const getHistory = async (
	userEmail?: string
): Promise<AuditResponse<AuditLog[]>> => {
	if (userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) {
		return { success: false, error: "Enter a valid email address." };
	}

	return AuditService.getHistory(userEmail?.trim());
};
