import {
  Conversation,
  ConversationWithUser,
  Message,
  OtherUserProfile,
  ListingSnippet,
  getConversationDetails as getConversationDetailsService,
  getConversations as getConversationsService,
  getMessages as getMessagesService,
  getOrCreateConversation as getOrCreateConversationService,
  sendMessage as sendMessageService,
  validateGetConversationDetailsRequest,
  validateGetConversationsRequest,
  validateGetMessagesRequest,
  validateGetOrCreateConversationRequest,
  validateSendMessageRequest,
  subscribeToMessages as subscribeToMessagesService,
} from "./chatService";
import { RealtimeChannel } from "@supabase/supabase-js";

export type { Conversation, ConversationWithUser, Message, OtherUserProfile, ListingSnippet };

export type ChatResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type GetOrCreateConversationDTO = {
  currentUserId: string;
  otherUserId: string;
  listingId?: number;
};

export type GetConversationsDTO = {
  userId: string;
};

export type GetConversationDetailsDTO = {
  conversationId: string;
  currentUserId: string;
};

export type GetMessagesDTO = {
  conversationId: string;
};

export type SendMessageDTO = {
  conversationId: string;
  senderId: string;
  content: string;
};

export type SubscribeToMessagesDTO = {
  conversationId: string;
  onNewMessage: (message: Message) => void;
};

export const getOrCreateConversation = async (
  request: GetOrCreateConversationDTO
): Promise<ChatResponse<Conversation>> => {
  const validation = validateGetOrCreateConversationRequest(request);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const conversation = await getOrCreateConversationService(
      request.currentUserId,
      request.otherUserId,
      request.listingId
    );
    return { success: true, data: conversation };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to get conversation." };
  }
};

export const getConversations = async (
  request: GetConversationsDTO
): Promise<ChatResponse<ConversationWithUser[]>> => {
  const validation = validateGetConversationsRequest(request);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const conversations = await getConversationsService(request.userId);
    return { success: true, data: conversations };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to fetch conversations." };
  }
};

export const getConversationDetails = async (
  request: GetConversationDetailsDTO
): Promise<ChatResponse<{ otherUser: OtherUserProfile; listing: ListingSnippet | null }>> => {
  const validation = validateGetConversationDetailsRequest(request);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const details = await getConversationDetailsService(request.conversationId, request.currentUserId);
    return { success: true, data: details };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to fetch conversation details." };
  }
};

export const getMessages = async (
  request: GetMessagesDTO
): Promise<ChatResponse<Message[]>> => {
  const validation = validateGetMessagesRequest(request);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const messages = await getMessagesService(request.conversationId);
    return { success: true, data: messages };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to fetch messages." };
  }
};

export const sendMessage = async (
  request: SendMessageDTO
): Promise<ChatResponse<Message>> => {
  const normalizedRequest = {
    ...request,
    content: request.content?.trim() ?? "",
  };

  const validation = validateSendMessageRequest(normalizedRequest);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const message = await sendMessageService(
      normalizedRequest.conversationId,
      normalizedRequest.senderId,
      normalizedRequest.content
    );
    return { success: true, data: message };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to send message." };
  }
};

export const subscribeToMessages = (
  request: SubscribeToMessagesDTO
): ChatResponse<RealtimeChannel> => {
  const validation = validateGetMessagesRequest({ conversationId: request.conversationId });
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (typeof request.onNewMessage !== "function") {
    return { success: false, error: "onNewMessage callback is required." };
  }

  try {
    const channel = subscribeToMessagesService(request.conversationId, request.onNewMessage);
    return { success: true, data: channel };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to subscribe to messages." };
  }
};
