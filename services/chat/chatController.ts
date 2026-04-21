export * from "./types";
import { Listing } from "@services/listings/listingController";
import {
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
} from "./chatService";
import type {
  ChatResponse,
  Conversation,
  ConversationWithUser,
  GetConversationDetailsDTO,
  GetConversationsDTO,
  GetMessagesDTO,
  GetOrCreateConversationDTO,
  Message,
  OtherUserProfile,
  SendMessageDTO,
} from "./types";

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
): Promise<ChatResponse<{ otherUser: OtherUserProfile; listing: Listing | null }>> => {
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
