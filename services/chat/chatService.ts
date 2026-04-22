import { supabase } from "@lib/supabase";
import { Listing } from "@services/listings/listingController";
import { isNonEmptyString, isPositiveInteger } from "@utils/validation";
import {
    Chat,
    ChatValidationResult,
    ChatWithUser,
    GetChatDetailsDTO,
    GetChatMessagesDTO,
    GetChatsDTO,
    GetOrCreateChatDTO,
    Message,
    OtherUserProfile,
    SendChatMessageDTO,
} from "./types";


export const validateGetOrCreateChatRequest = (
  request: GetOrCreateChatDTO
): ChatValidationResult => {
  if (!isNonEmptyString(request.currentUserId)) {
    return { valid: false, error: "Current user ID is required." };
  }

  if (!isNonEmptyString(request.otherUserId)) {
    return { valid: false, error: "Other user ID is required." };
  }

  if (request.currentUserId === request.otherUserId) {
    return { valid: false, error: "You cannot start a chat with yourself." };
  }

  if (typeof request.listingId !== "undefined" && !isPositiveInteger(request.listingId)) {
    return { valid: false, error: "Listing ID must be a positive integer." };
  }

  return { valid: true };
};

export const validateGetChatsRequest = (
  request: GetChatsDTO
): ChatValidationResult => {
  if (!isNonEmptyString(request.userId)) {
    return { valid: false, error: "User ID is required." };
  }

  return { valid: true };
};

export const validateGetChatDetailsRequest = (
  request: GetChatDetailsDTO
): ChatValidationResult => {
  if (!isNonEmptyString(request.chatId)) {
    return { valid: false, error: "Chat ID is required." };
  }

  if (!isNonEmptyString(request.currentUserId)) {
    return { valid: false, error: "Current user ID is required." };
  }

  return { valid: true };
};

export const validateGetChatMessagesRequest = (
  request: GetChatMessagesDTO
): ChatValidationResult => {
  if (!isNonEmptyString(request.chatId)) {
    return { valid: false, error: "Chat ID is required." };
  }

  return { valid: true };
};

export const validateSendChatMessageRequest = (
  request: SendChatMessageDTO
): ChatValidationResult => {
  if (!isNonEmptyString(request.chatId)) {
    return { valid: false, error: "Chat ID is required." };
  }

  if (!isNonEmptyString(request.senderId)) {
    return { valid: false, error: "Sender ID is required." };
  }

  if (!isNonEmptyString(request.content)) {
    return { valid: false, error: "Message content cannot be empty." };
  }

  return { valid: true };
};

// Get or create a chat between two users, optionally linked to a listing.
export const getOrCreateChat = async (
  currentUserId: string,
  otherUserId: string,
  listingId?: number
): Promise<Chat> => {
  let query = supabase
    .from("Conversations")
    .select("*")
    .or(
      `and(user1_id.eq.${currentUserId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${currentUserId})`
    )
    .order("created_at", { ascending: false })
    .limit(1);

  if (typeof listingId === "number") {
    query = query.eq("listing_id", listingId);
  }

  const { data: existingRows, error: existingError } = await query;

  if (existingError) {
    console.error("Error checking existing chat:", existingError);
    throw existingError;
  }

  if (existingRows && existingRows.length > 0) {
    return existingRows[0];
  }

  const { data, error } = await supabase
    .from("Conversations")
    .insert({
      user1_id: currentUserId,
      user2_id: otherUserId,
      listing_id: listingId ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Error creating chat:", error);
    throw error ?? new Error("Chat was not created.");
  }

  return data;
};

// Get all chats for the current user with counterparty profile and full listing.
export const getChats = async (userId: string): Promise<ChatWithUser[]> => {
  const { data, error } = await supabase
    .from("Conversations")
    .select("*")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    throw error;
  }

  if (!data || data.length === 0) return [];

  const enriched = await Promise.all(
    data.map(async (conv) => {
      const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

      const [otherUserResult, listingResult] = await Promise.all([
        supabase
          .from("Users")
          .select("userId, firstName, lastName, profilePicture, phoneNumber, email")
          .eq("userId", otherUserId)
          .single(),
        conv.listing_id
          ? supabase
            .from("Listings")
            .select("*, ListingLocations(*)")
            .eq("id", conv.listing_id)
            .single()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (otherUserResult.error) {
        console.warn("Could not load other user profile for chat", conv.id, otherUserResult.error);
      }

      if ((listingResult as any).error) {
        console.warn("Could not load listing for chat", conv.id, (listingResult as any).error);
      }

      return {
        ...conv,
        otherUser: otherUserResult.data ?? {
          userId: otherUserId,
          firstName: "Unknown",
          lastName: "",
          profilePicture: null,
          phoneNumber: null,
          email: null,
        },
        listing: (listingResult as any).data as Listing | null,
      };
    })
  );

  return enriched;
};

// Get profile and listing details for a specific chat.
export const getChatDetails = async (
  chatId: string,
  currentUserId: string
): Promise<{ otherUser: OtherUserProfile; listing: Listing | null; listingId: number | null }> => {
  const { data: conv, error } = await supabase
    .from("Conversations")
    .select("user1_id, user2_id, listing_id")
    .eq("id", chatId)
    .single();

  if (error || !conv) {
    console.error("Error fetching chat details:", error);
    throw error ?? new Error("Chat not found.");
  }

  const otherUserId = conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id;

  const [otherUserResult, listingResult] = await Promise.all([
    supabase
      .from("Users")
      .select("userId, firstName, lastName, profilePicture, phoneNumber, email")
      .eq("userId", otherUserId)
      .single(),
    conv.listing_id
      ? supabase
        .from("Listings")
        .select("*, ListingLocations(*)")
        .eq("id", conv.listing_id)
        .single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  return {
    otherUser: otherUserResult.data ?? {
      userId: otherUserId,
      firstName: "Unknown",
      lastName: "",
      profilePicture: null,
      phoneNumber: null,
      email: null,
    },
    listing: (listingResult as any).data as Listing | null,
    listingId: conv.listing_id ?? null,
  };
};

export const getChatMeta = async (
  chatId: string,
  currentUserId: string
): Promise<{ otherUserId: string; listingId: number | null }> => {
  const { data: conv, error } = await supabase
    .from("Conversations")
    .select("user1_id, user2_id, listing_id")
    .eq("id", chatId)
    .single();

  if (error || !conv) {
    console.error("Error fetching chat meta:", error);
    throw error ?? new Error("Chat not found.");
  }

  const otherUserId = conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id;

  return {
    otherUserId,
    listingId: conv.listing_id ?? null,
  };
};

export const getMessages = async (chatId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from("Messages")
    .select("*")
    .eq("conversation_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }

  return data ?? [];
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  content: string
): Promise<Message> => {
  const { data, error } = await supabase
    .from("Messages")
    .insert({
      conversation_id: chatId,
      sender_id: senderId,
      content,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Error sending chat message:", error);
    throw error ?? new Error("Message was not created.");
  }

  const { error: updateError } = await supabase
    .from("Conversations")
    .update({
      last_message: content,
      last_message_at: new Date().toISOString(),
    })
    .eq("id", chatId);

  if (updateError) {
    console.warn("Failed to update chat preview:", updateError);
  }

  return data;
};
