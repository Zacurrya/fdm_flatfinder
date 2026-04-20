import { ChatResponse, getMessages, GetMessagesDTO, Message } from "@services/chat/chatController";
import { CityChatResponse, getCityChatMessages, GetCityChatMessagesDTO } from "@services/cityChat/cityChatController";
import { CityChatMessage, CityChatMessageWithSender } from "@services/cityChat/cityChatService";

export type MappedChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName?: string;
  senderProfilePicture?: string | null;
};

export const mapConversationMessage = (message: Message): MappedChatMessage => ({
  id: String(message.id),
  content: message.content,
  createdAt: message.created_at,
  senderId: message.sender_id,
});

export const mapCityChatMessage = (
  message: CityChatMessageWithSender | CityChatMessage
): MappedChatMessage => ({
  id: String(message.id),
  content: message.content,
  createdAt: message.created_at,
  senderId: message.senderId,
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
