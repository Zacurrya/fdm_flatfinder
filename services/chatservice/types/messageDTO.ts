
export interface MessageDTO {
  senderId: number;
  targetId: number;
  content: string;
  relevantListing?: string;
}
