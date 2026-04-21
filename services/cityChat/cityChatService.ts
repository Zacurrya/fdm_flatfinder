import { Database } from "@/types/database.types";
import { supabase } from "@lib/supabase";
import { isNonEmptyString, isPositiveInteger, SupabaseErrorLike } from "@utils/validation";
import {
  CityChat,
  CityChatMessage,
  CityChatMessageWithSender,
  CityChatSenderProfile,
  CityChatValidationResult,
  GetCityChatByCityDTO,
  GetCityChatMessagesDTO,
  GetCityChatSenderProfileDTO,
  SendCityChatMessageDTO,
} from "./types";

type UnifiedMessageRow = Database["public"]["Tables"]["Messages"]["Row"];

export const validateGetCityChatByCityRequest = (
  request: GetCityChatByCityDTO
): CityChatValidationResult => {
  if (!isNonEmptyString(request.city)) {
    return { valid: false, error: "City is required." };
  }

  return { valid: true };
};

export const validateGetCityChatMessagesRequest = (
  request: GetCityChatMessagesDTO
): CityChatValidationResult => {
  if (!isPositiveInteger(request.cityChatId)) {
    return { valid: false, error: "City chat ID must be a positive integer." };
  }

  return { valid: true };
};

export const validateSendCityChatMessageRequest = (
  request: SendCityChatMessageDTO
): CityChatValidationResult => {
  if (!isPositiveInteger(request.cityChatId)) {
    return { valid: false, error: "City chat ID must be a positive integer." };
  }

  if (!isNonEmptyString(request.senderId)) {
    return { valid: false, error: "Sender ID is required." };
  }

  if (!isNonEmptyString(request.content)) {
    return { valid: false, error: "Message content cannot be empty." };
  }

  return { valid: true };
};

export const validateGetCityChatSenderProfileRequest = (
  request: GetCityChatSenderProfileDTO
): CityChatValidationResult => {
  if (!isNonEmptyString(request.senderId)) {
    return { valid: false, error: "Sender ID is required." };
  }

  return { valid: true };
};

const getCityChatSenderProfiles = async (
  senderIds: string[]
): Promise<Record<string, CityChatSenderProfile>> => {
  const uniqueSenderIds = Array.from(new Set(senderIds.filter(isNonEmptyString)));
  if (uniqueSenderIds.length === 0) {
    return {};
  }

  const result = (await supabase
    .from("Users")
    .select("userId, firstName, lastName, profilePicture")
    .in("userId", uniqueSenderIds)) as {
      data: CityChatSenderProfile[] | null;
      error: SupabaseErrorLike | null;
    };

  if (result.error) {
    console.warn("Failed to fetch city chat sender profiles:", result.error);
    return {};
  }

  return (result.data ?? []).reduce<Record<string, CityChatSenderProfile>>((acc, profile) => {
    acc[profile.userId] = profile;
    return acc;
  }, {});
};

const mapRowToCityChatMessage = (row: UnifiedMessageRow): CityChatMessage => ({
  id: String(row.id),
  cityChatId: Number(row.city_chat_id ?? 0),
  senderId: row.sender_id,
  content: row.content,
  created_at: row.created_at,
  read_at: row.read_at ?? null,
});

// Gets one city chat by city name, creating it if needed.
export const getOrCreateCityChatByCity = async (city: string): Promise<CityChat> => {
  const normalizedCity = city.trim();

  const existingResult = (await supabase
    .from("CityChats" as any)
    .select("*")
    .eq("city", normalizedCity)
    .maybeSingle()) as {
      data: CityChat | null;
      error: SupabaseErrorLike | null;
    };

  if (existingResult.error) {
    console.error("Error fetching city chat:", existingResult.error);
    throw existingResult.error;
  }

  if (existingResult.data) {
    return existingResult.data;
  }

  const createdResult = (await supabase
    .from("CityChats" as any)
    .insert({ city: normalizedCity })
    .select()
    .single()) as {
      data: CityChat | null;
      error: SupabaseErrorLike | null;
    };

  if (createdResult.error || !createdResult.data) {
    console.error("Error creating city chat:", createdResult.error);
    throw createdResult.error ?? new Error("City chat was not created.");
  }

  return createdResult.data;
};

// Gets all city chats ordered by most recent activity.
export const fetchCityChats = async (): Promise<CityChat[]> => {
  const result = (await supabase
    .from("CityChats" as any)
    .select("*")
    .order("last_message_at", { ascending: false })
    .order("created_at", { ascending: false })) as {
      data: CityChat[] | null;
      error: SupabaseErrorLike | null;
    };

  if (result.error) {
    console.error("Error fetching city chats:", result.error);
    throw result.error;
  }

  return result.data ?? [];
};

export const getCityChatMessages = async (cityChatId: number): Promise<CityChatMessageWithSender[]> => {
  const result = (await supabase
    .from("Messages")
    .select("id, city_chat_id, sender_id, content, created_at, read_at")
    .eq("city_chat_id", cityChatId)
    .order("created_at", { ascending: true })) as {
      data: UnifiedMessageRow[] | null;
      error: SupabaseErrorLike | null;
    };

  if (result.error) {
    console.error("Error fetching city chat messages:", result.error);
    throw result.error;
  }

  const messages = (result.data ?? []).map(mapRowToCityChatMessage);
  const profilesBySenderId = await getCityChatSenderProfiles(messages.map((message) => message.senderId));

  return messages.map((message) => ({
    ...message,
    sender: profilesBySenderId[message.senderId] ?? null,
  }));
};

export const getCityChatParticipantCount = async (cityChatId: number): Promise<number> => {
  const result = await supabase
    .from("Messages")
    .select("sender_id", { count: "exact", head: true })
    .eq("city_chat_id", cityChatId);

  if (result.error) {
    console.error("Error fetching city chat participant count:", result.error);
    return 0;
  }

  // To get UNIQUE participants, the above count: "exact" on a select head: true might just count messages.
  // Better way:
  const uniqueResult = await supabase
    .from("Messages")
    .select("sender_id")
    .eq("city_chat_id", cityChatId);

  if (uniqueResult.error || !uniqueResult.data) {
    return 0;
  }

  const distinctSenders = new Set(uniqueResult.data.map((m: any) => m.sender_id));
  return distinctSenders.size;
};

export const sendCityChatMessage = async (
  cityChatId: number,
  senderId: string,
  content: string
): Promise<CityChatMessageWithSender> => {
  const normalizedContent = content.trim();

  const insertResult = (await supabase
    .from("Messages")
    .insert({
      conversation_id: null,
      city_chat_id: cityChatId,
      sender_id: senderId,
      content: normalizedContent,
    })
    .select()
    .single()) as {
      data: UnifiedMessageRow | null;
      error: SupabaseErrorLike | null;
    };

  if (insertResult.error || !insertResult.data) {
    console.error("Error sending city chat message:", insertResult.error);
    throw insertResult.error ?? new Error("Message was not created.");
  }

  const updateResult = (await supabase
    .from("CityChats" as any)
    .update({
      last_message: normalizedContent,
      last_message_at: new Date().toISOString(),
    })
    .eq("id", cityChatId)) as {
      error: SupabaseErrorLike | null;
    };

  if (updateResult.error) {
    console.warn("Failed to update city chat preview:", updateResult.error);
  }

  const senderProfile = await getCityChatSenderProfile(senderId);

  return {
    ...mapRowToCityChatMessage(insertResult.data),
    sender: senderProfile,
  };
};

export const getCityChatSenderProfile = async (
  senderId: string
): Promise<CityChatSenderProfile | null> => {
  const result = (await supabase
    .from("Users")
    .select("userId, firstName, lastName, profilePicture")
    .eq("userId", senderId)
    .maybeSingle()) as {
      data: CityChatSenderProfile | null;
      error: SupabaseErrorLike | null;
    };

  if (result.error) {
    console.warn("Failed to fetch city chat sender profile:", result.error);
    return null;
  }

  return result.data;
};
