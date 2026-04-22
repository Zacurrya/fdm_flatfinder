import {
  fetchCityChats as fetchCityChatsService,
  getCityChatMessages as getCityChatMessagesService,
  getCityChatParticipantCount as getCityChatParticipantCountService,
  getCityChatSenderProfile as getCityChatSenderProfileService,
  getOrCreateCityChatByCity as getOrCreateCityChatByCityService,
  sendCityChatMessage as sendCityChatMessageService,
  validateGetCityChatByCityRequest,
  validateGetCityChatMessagesRequest,
  validateGetCityChatSenderProfileRequest,
  validateSendCityChatMessageRequest,
} from "./cityChatService";
import type {
  CityChat,
  CityChatMessageWithSender,
  CityChatResponse,
  CityChatSenderProfile,
  GetCityChatByCityDTO,
  GetCityChatMessagesDTO,
  GetCityChatSenderProfileDTO,
  SendCityChatMessageDTO,
} from "./types";
export * from "./types";

/**
 * getOrCreateCityChatByCity
 * Loads an existing city chat for a city or creates one if needed.
 *
 * @param request The city lookup payload.
 * @returns A city chat response containing the chat row.
 */
export const getOrCreateCityChatByCity = async (
  request: GetCityChatByCityDTO
): Promise<CityChatResponse<CityChat>> => {
  const normalizedRequest = {
    ...request,
    city: request.city?.trim() ?? "",
  };

  const validation = validateGetCityChatByCityRequest(normalizedRequest);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const cityChat = await getOrCreateCityChatByCityService(normalizedRequest.city);
    return { success: true, data: cityChat };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to get city chat." };
  }
};

/**
 * fetchCityChats
 * Loads the list of available city chats.
 *
 * @returns A city chat response containing the city chat list.
 */
export const fetchCityChats = async (): Promise<CityChatResponse<CityChat[]>> => {
  try {
    const cityChats = await fetchCityChatsService();
    return { success: true, data: cityChats };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to fetch city chats." };
  }
};

/**
 * getCityChatMessages
 * Loads the message history for a city chat.
 *
 * @param request The city chat message lookup payload.
 * @returns A city chat response containing the message list.
 */
export const getCityChatMessages = async (
  request: GetCityChatMessagesDTO
): Promise<CityChatResponse<CityChatMessageWithSender[]>> => {
  const validation = validateGetCityChatMessagesRequest(request);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const messages = await getCityChatMessagesService(request.cityChatId);
    return { success: true, data: messages };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to fetch city chat messages." };
  }
};

/**
 * getCityChatParticipantCount
 * Counts the participants currently active in a city chat.
 *
 * @param request The city chat lookup payload.
 * @returns A city chat response containing the participant count.
 */
export const getCityChatParticipantCount = async (
  request: GetCityChatMessagesDTO
): Promise<CityChatResponse<number>> => {
  const validation = validateGetCityChatMessagesRequest(request);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const count = await getCityChatParticipantCountService(request.cityChatId);
    return { success: true, data: count };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to fetch participant count." };
  }
};

/**
 * sendCityChatMessage
 * Validates and sends a message into a city chat.
 *
 * @param request The city chat message payload.
 * @returns A city chat response containing the created message.
 */
export const sendCityChatMessage = async (
  request: SendCityChatMessageDTO
): Promise<CityChatResponse<CityChatMessageWithSender>> => {
  const normalizedRequest = {
    ...request,
    content: request.content?.trim() ?? "",
  };

  const validation = validateSendCityChatMessageRequest(normalizedRequest);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const message = await sendCityChatMessageService(
      normalizedRequest.cityChatId,
      normalizedRequest.senderId,
      normalizedRequest.content
    );

    return { success: true, data: message };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to send city chat message." };
  }
};

/**
 * getCityChatSenderProfile
 * Resolves the sender profile for a city chat message.
 *
 * @param request The sender lookup payload.
 * @returns A city chat response containing the sender profile or null.
 */
export const getCityChatSenderProfile = async (
  request: GetCityChatSenderProfileDTO
): Promise<CityChatResponse<CityChatSenderProfile | null>> => {
  const validation = validateGetCityChatSenderProfileRequest(request);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const profile = await getCityChatSenderProfileService(request.senderId);
    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to fetch sender profile." };
  }
};
