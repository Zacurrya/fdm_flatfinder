export interface Message {
  messageId?: number;
  senderId: number;
  content: string;
  chatGroup?: string;
  timestamp?: Date;
  mentions?: number[];
  url?: string;
}
