export type ActionType =
  | "USER_APPROVED"
  | "USER_DENIED"
  | "USER_BANNED"
  | "MESSAGE_DELETED"
  | "SIGN_UP_REQUESTED"
  | "SIGN_UP_APPROVED"
  | "SIGN_UP_DENIED"
  | "CITY_CHANGE_REQUESTED"
  | "CITY_CHANGE_APPROVED"
  | "CITY_CHANGE_DENIED";

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
