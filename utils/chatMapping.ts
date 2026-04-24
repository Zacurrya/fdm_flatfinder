import { MessageRecord } from "@/types/records";

// Unified message shape consumed by chat UI components and hooks.
export type MappedChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName?: string;
  senderProfilePicture?: string | null;
};

// Maps private message rows to the shared chat message shape.
export const mapChatMessage = (message: MessageRecord): MappedChatMessage => ({
  id: String(message.id),
  content: message.content,
  createdAt: message.createdAt,
  senderId: message.senderId,
});
