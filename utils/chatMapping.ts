import { Message } from "@services/chat/chatController";
import {
  CityChatMessage,
  CityChatMessageWithSender,
} from "@services/cityChat/cityChatController";

// Unified message shape consumed by chat UI components and hooks.
export type MappedChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  sender_id: string;
  senderName?: string;
  senderProfilePicture?: string | null;
};

// Minimal row shape emitted by realtime subscriptions for city chat messages.
export type CityChatRealtimeMessageRow = {
  id: string | number;
  content: string;
  created_at: string;
  sender_id: string;
};

// Maps private message rows to the shared chat message shape.
export const mapChatMessage = (message: Message): MappedChatMessage => ({
  id: String(message.id),
  content: message.content,
  createdAt: message.created_at,
  sender_id: message.sender_id,
});

/**
 * Maps city chat payloads (history or realtime) into the shared chat message shape.
 * Normalizes sender identity to sender_id and attaches optional expanded sender profile.
 *
 * @param message A city chat message payload from fetch or realtime sources.
 */
export const mapCityChatMessage = (
  message: CityChatMessageWithSender | CityChatMessage | CityChatRealtimeMessageRow
): MappedChatMessage => {
  const sender = "sender" in message ? message.sender : null;

  return {
    id: String(message.id),
    content: message.content,
    createdAt: message.created_at,
    sender_id: "sender_id" in message ? message.sender_id : message.senderId,
    senderName: sender
      ? [sender.firstName, sender.lastName].filter(Boolean).join(" ") || "Consultant"
      : undefined,
    senderProfilePicture: sender ? sender.profilePicture : null,
  };
};
