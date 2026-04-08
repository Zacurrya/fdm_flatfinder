export type ActionType =
  | "USER_APPROVED"
  | "USER_DENIED"
  | "USER_BANNED"
  | "MESSAGE_DELETED"
  | "LOGIN_ATTEMPT"     
  | "PASSWORD_RESET";    

export interface AuditLogDTO {
  adminId: string;       
  targetId: string;
  actionType: ActionType;
  details?: string;      
}

export interface AuditLog {
  auditId: number | string;
  adminId: string;
  targetId: string;
  adminEmail?: string;   
  targetEmail?: string;
  actionType: ActionType;
  details?: string;      
  timeStamp: string;
}

export interface AuditResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}
