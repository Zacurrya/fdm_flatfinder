import { supabase } from "@lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export type CityChat = {
  id: number;
  city: string;
  created_at: string;
  last_message: string | null;
  last_message_at: string | null;
};

export type CityChatMessage = {
  id: number;
  CityChatId: number;
  senderId: string;
  content: string;
  created_at: string;
};

export type CityChatSenderProfile = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
};

export type CityChatMessageWithSender = CityChatMessage & {
  sender: CityChatSenderProfile | null;
};

export type CityChatValidationResult =
  | { valid: true }
  | { valid: false; error: string };

type SupabaseErrorLike = {
  message: string;
};

type GetCityChatByCityRequest = {
  city: string;
};

type GetCityChatMessagesRequest = {
  cityChatId: number;
};

type SendCityChatMessageRequest = {
  cityChatId: number;
  senderId: string;
  content: string;
};

type GetCityChatSenderProfileRequest = {
  senderId: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

export const validateGetCityChatByCityRequest = (
  request: GetCityChatByCityRequest
): CityChatValidationResult => {
  if (!isNonEmptyString(request.city)) {
    return { valid: false, error: "City is required." };
  }

  return { valid: true };
};

export const validateGetCityChatMessagesRequest = (
  request: GetCityChatMessagesRequest
): CityChatValidationResult => {
  if (!isPositiveInteger(request.cityChatId)) {
    return { valid: false, error: "City chat ID must be a positive integer." };
  }

  return { valid: true };
};

export const validateSendCityChatMessageRequest = (
  request: SendCityChatMessageRequest
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
  request: GetCityChatSenderProfileRequest
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
    .from("CityChatMessages" as any)
    .select("*")
    .eq("CityChatId", cityChatId)
    .order("created_at", { ascending: true })) as {
    data: CityChatMessage[] | null;
    error: SupabaseErrorLike | null;
  };

  if (result.error) {
    console.error("Error fetching city chat messages:", result.error);
    throw result.error;
  }

  const messages = result.data ?? [];
  const profilesBySenderId = await getCityChatSenderProfiles(messages.map((message) => message.senderId));

  return messages.map((message) => ({
    ...message,
    sender: profilesBySenderId[message.senderId] ?? null,
  }));
};

export const sendCityChatMessage = async (
  cityChatId: number,
  senderId: string,
  content: string
): Promise<CityChatMessageWithSender> => {
  const normalizedContent = content.trim();

  const insertResult = (await supabase
    .from("CityChatMessages" as any)
    .insert({
      CityChatId: cityChatId,
      senderId,
      content: normalizedContent,
    })
    .select()
    .single()) as {
    data: CityChatMessage | null;
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
    ...insertResult.data,
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

export const subscribeToCityChatMessages = (
  cityChatId: number,
  onNewMessage: (message: CityChatMessage) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`city-chat:${cityChatId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "CityChatMessages",
        filter: `CityChatId=eq.${cityChatId}`,
      },
      (payload) => {
        onNewMessage(payload.new as CityChatMessage);
      }
    )
    .subscribe();

  return channel;
};
