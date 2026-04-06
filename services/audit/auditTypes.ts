export type ActionType =
  | "USER_APPROVED"
  | "USER_DENIED"
  | "USER_BANNED"
  | "MESSAGE_DELETED";

export interface AuditLogDTO {
  userId: string;
  targetId: string;
  actionType: ActionType;
}

export interface AuditLog {
  auditId: number | string;
  userId: string;
  targetId: string;
  actionType: ActionType;
  timeStamp: string;
}

export interface AuditResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}
