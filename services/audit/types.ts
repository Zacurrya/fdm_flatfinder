import { Enums } from "@/types/database.types";

export type ActionType = Enums<"ActionType">;

export interface AuditLogDTO {
  userId: string;
  targetId: string;
  actionType: ActionType;
}

export interface AuditLog {
  auditId: number | string;
  userId: string;
  targetId: string;
  userEmail?: string;
  targetEmail?: string;
  actionType: ActionType;
  timeStamp: string;
}

export interface AuditResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}
