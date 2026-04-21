import {
  CityChat,
  CityChatMessage,
  CityChatMessageWithSender,
  CityChatResponse,
  CityChatSenderProfile,
  GetCityChatByCityDTO,
  GetCityChatMessagesDTO,
  GetCityChatSenderProfileDTO,
  SendCityChatMessageDTO,
} from "./types";
import {
  fetchCityChats as fetchCityChatsService,
  getCityChatMessages as getCityChatMessagesService,
  getCityChatParticipantCount as getCityChatParticipantCountService,
  getOrCreateCityChatByCity as getOrCreateCityChatByCityService,
  getCityChatSenderProfile as getCityChatSenderProfileService,
  sendCityChatMessage as sendCityChatMessageService,
  validateGetCityChatByCityRequest,
  validateGetCityChatMessagesRequest,
  validateGetCityChatSenderProfileRequest,
  validateSendCityChatMessageRequest,
} from "./cityChatService";

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

export const fetchCityChats = async (): Promise<CityChatResponse<CityChat[]>> => {
  try {
    const cityChats = await fetchCityChatsService();
    return { success: true, data: cityChats };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to fetch city chats." };
  }
};

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
