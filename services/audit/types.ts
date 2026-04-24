import { ActionType } from "@/types/enums";


export type CreateAuditLogDTO = {
  userId: string;
  targetId: string;
  actionType: ActionType;
};
