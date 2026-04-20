import { RealtimeChannel } from "@supabase/supabase-js";
import {
  CityChat,
  CityChatMessage,
  CityChatMessageWithSender,
  CityChatSenderProfile,
  fetchCityChats as fetchCityChatsService,
  getCityChatMessages as getCityChatMessagesService,
  getCityChatParticipantCount as getCityChatParticipantCountService,
  getOrCreateCityChatByCity as getOrCreateCityChatByCityService,
  getCityChatSenderProfile as getCityChatSenderProfileService,
  sendCityChatMessage as sendCityChatMessageService,
  subscribeToCityChatMessages as subscribeToCityChatMessagesService,
  validateGetCityChatByCityRequest,
  validateGetCityChatMessagesRequest,
  validateGetCityChatSenderProfileRequest,
  validateSendCityChatMessageRequest,
} from "./cityChatService";

export type { CityChat, CityChatMessage, CityChatMessageWithSender, CityChatSenderProfile };

export type CityChatResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type GetCityChatByCityDTO = {
  city: string;
};

export type GetCityChatMessagesDTO = {
  cityChatId: number;
};

export type SendCityChatMessageDTO = {
  cityChatId: number;
  senderId: string;
  content: string;
};

export type SubscribeToCityChatMessagesDTO = {
  cityChatId: number;
  onNewMessage: (message: CityChatMessage) => void;
};

export type GetCityChatSenderProfileDTO = {
  senderId: string;
};

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

export const subscribeToCityChatMessages = (
  request: SubscribeToCityChatMessagesDTO
): CityChatResponse<RealtimeChannel> => {
  const validation = validateGetCityChatMessagesRequest({ cityChatId: request.cityChatId });
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (typeof request.onNewMessage !== "function") {
    return { success: false, error: "onNewMessage callback is required." };
  }

  try {
    const channel = subscribeToCityChatMessagesService(
      request.cityChatId,
      request.onNewMessage
    );

    return { success: true, data: channel };
  } catch (error) {
    return { success: false, error: (error as Error)?.message ?? "Failed to subscribe to city chat messages." };
  }
};
