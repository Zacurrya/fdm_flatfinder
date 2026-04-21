import {
  ChatResponse,
  getMessages,
  GetMessagesDTO,
  Message,
} from "@services/chat/chatController";
import {
  CityChatMessage,
  CityChatMessageWithSender,
  CityChatResponse,
  getCityChatMessages,
  GetCityChatMessagesDTO,
} from "@services/cityChat/cityChatController";

export type MappedChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName?: string;
  senderProfilePicture?: string | null;
};

export type CityChatRealtimeMessageRow = {
  id: string | number;
  content: string;
  created_at: string;
  sender_id: string;
};

export const mapConversationMessage = (message: Message): MappedChatMessage => ({
  id: String(message.id),
  content: message.content,
  createdAt: message.created_at,
  senderId: message.sender_id,
});

export const mapCityChatMessage = (
  message: CityChatMessageWithSender | CityChatMessage | CityChatRealtimeMessageRow
): MappedChatMessage => ({
  id: String(message.id),
  content: message.content,
  createdAt: message.created_at,
  senderId: "senderId" in message ? message.senderId : message.sender_id,
  senderName:
    "sender" in message && message.sender
      ? [message.sender.firstName, message.sender.lastName].filter(Boolean).join(" ") || "Consultant"
      : undefined,
  senderProfilePicture:
    "sender" in message && message.sender
      ? message.sender.profilePicture
      : null,
});

export const fetchAndMapConversationMessages = async (
  request: GetMessagesDTO
): Promise<ChatResponse<MappedChatMessage[]>> => {
  const result = await getMessages(request);
  if (!result.success || !result.data) {
    return { success: false, error: result.error ?? "Failed to fetch messages." };
  }

  return {
    success: true,
    data: result.data.map(mapConversationMessage),
  };
};

export const fetchAndMapCityChatMessages = async (
  request: GetCityChatMessagesDTO
): Promise<CityChatResponse<MappedChatMessage[]>> => {
  const result = await getCityChatMessages(request);
  if (!result.success || !result.data) {
    return { success: false, error: result.error ?? "Failed to fetch city chat messages." };
  }

  return {
    success: true,
    data: result.data.map(mapCityChatMessage),
  };
};
