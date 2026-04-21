import { Constants } from "@/types/database.types";
import * as AuditService from "./auditService";
import { ActionType, AuditLog, AuditResponse } from "./types";

const ACTION_TYPES = Constants.public.Enums.ActionType;

function requireNonEmpty(value: string | undefined | null, fieldName: string): string | null {
    const normalized = value?.trim() ?? "";
    if (!normalized) {
        return `${fieldName} is required.`;
    }

    return null;
}

export const logAudit = async (
    action: ActionType,
    targetId: string
): Promise<AuditResponse<AuditLog>> => {
    if (!ACTION_TYPES.includes(action)) {
        return { success: false, error: "Action type is invalid." };
    }

    const targetIdError = requireNonEmpty(targetId, "Target ID");
    if (targetIdError) {
        return { success: false, error: targetIdError };
    }

    return AuditService.logAudit(action, targetId.trim());
};

export const getHistory = async (): Promise<AuditResponse<AuditLog[]>> => {
    return AuditService.getHistory();
};