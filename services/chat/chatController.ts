import { Listing } from "@services/listings/listingController";
import {
  getChatDetails as getChatDetailsService,
  getChatMeta as getChatMetaService,
  getChats as getChatsService,
  getMessages as getMessagesService,
  getOrCreateChat as getOrCreateChatService,
  sendMessage as sendMessageService,
  validateGetChatDetailsRequest,
  validateGetChatMessagesRequest,
  validateGetChatsRequest,
  validateGetOrCreateChatRequest,
  validateSendChatMessageRequest,
} from "./chatService";
import type {
  Chat,
  ChatResponse,
  ChatWithUser,
  GetChatDetailsDTO,
  GetChatMessagesDTO,
  GetChatsDTO,
  GetOrCreateChatDTO,
  Message,
  OtherUserProfile,
  SendChatMessageDTO,
} from "./types";

export * from "./types";

/**
 * getOrCreateChat
 * Gets the existing private chat for two users or creates a new one.
 *
 * @param request The chat creation lookup payload.
 * @returns A chat response containing the chat row.
 */
export const getOrCreateChat = async (
  request: GetOrCreateChatDTO
): Promise<ChatResponse<Chat>> => {
  const validation = validateGetOrCreateChatRequest(request);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const chat = await getOrCreateChatService(
      request.currentUserId,
      request.otherUserId,
      request.listingId
    );
    return { success: true, data: chat };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to get chat." };
  }
};

/**
 * getChats
 * Loads all private chats for the current user.
 *
 * @param request The requesting user payload.
 * @returns A chat response containing the chat list.
 */
export const getChats = async (
  request: GetChatsDTO
): Promise<ChatResponse<ChatWithUser[]>> => {
  const validation = validateGetChatsRequest(request);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const chats = await getChatsService(request.userId);
    return { success: true, data: chats };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to fetch chats." };
  }
};

/**
 * getChatDetails
 * Loads the other user and linked listing for a private chat.
 *
 * @param request The chat details lookup payload.
 * @returns A chat response containing the resolved details.
 */
export const getChatDetails = async (
  request: GetChatDetailsDTO
): Promise<ChatResponse<{ otherUser: OtherUserProfile; listing: Listing | null; listingId: number | null }>> => {
  const validation = validateGetChatDetailsRequest(request);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const details = await getChatDetailsService(request.chatId, request.currentUserId);
    return { success: true, data: details };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to fetch chat details." };
  }
};

/**
 * getChatMeta
 * Loads only the metadata needed to derive the private chat participants.
 *
 * @param request The chat metadata lookup payload.
 * @returns A chat response containing the other user ID and listing ID.
 */
export const getChatMeta = async (
  request: GetChatDetailsDTO
): Promise<ChatResponse<{ otherUserId: string; listingId: number | null }>> => {
  const validation = validateGetChatDetailsRequest(request);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const meta = await getChatMetaService(request.chatId, request.currentUserId);
    return { success: true, data: meta };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to fetch chat meta." };
  }
};

/**
 * getMessages
 * Loads the message history for a private chat.
 *
 * @param request The chat ID payload.
 * @returns A chat response containing the message list.
 */
export const getMessages = async (
  request: GetChatMessagesDTO
): Promise<ChatResponse<Message[]>> => {
  const validation = validateGetChatMessagesRequest(request);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const messages = await getMessagesService(request.chatId);
    return { success: true, data: messages };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to fetch messages." };
  }
};

/**
 * sendMessage
 * Validates and sends a private chat message.
 *
 * @param request The message payload.
 * @returns A chat response containing the created message.
 */
export const sendMessage = async (
  request: SendChatMessageDTO
): Promise<ChatResponse<Message>> => {
  const normalizedRequest = {
    ...request,
    content: request.content?.trim() ?? "",
  };

  const validation = validateSendChatMessageRequest(normalizedRequest);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const message = await sendMessageService(
      normalizedRequest.chatId,
      normalizedRequest.senderId,
      normalizedRequest.content
    );
    return { success: true, data: message };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to send message." };
  }
};
