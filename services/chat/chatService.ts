import { supabase } from "@lib/supabase";
import { Listing } from "@services/listings/listingController";
import { isNonEmptyString, isPositiveInteger } from "@utils/validation";
import {
    ChatValidationResult,
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


export const validateGetOrCreateConversationRequest = (
  request: GetOrCreateConversationDTO
): ChatValidationResult => {
  if (!isNonEmptyString(request.currentUserId)) {
    return { valid: false, error: "Current user ID is required." };
  }

  if (!isNonEmptyString(request.otherUserId)) {
    return { valid: false, error: "Other user ID is required." };
  }

  if (request.currentUserId === request.otherUserId) {
    return { valid: false, error: "You cannot start a conversation with yourself." };
  }

  if (typeof request.listingId !== "undefined" && !isPositiveInteger(request.listingId)) {
    return { valid: false, error: "Listing ID must be a positive integer." };
  }

  return { valid: true };
};

export const validateGetConversationsRequest = (
  request: GetConversationsDTO
): ChatValidationResult => {
  if (!isNonEmptyString(request.userId)) {
    return { valid: false, error: "User ID is required." };
  }

  return { valid: true };
};

export const validateGetConversationDetailsRequest = (
  request: GetConversationDetailsDTO
): ChatValidationResult => {
  if (!isNonEmptyString(request.conversationId)) {
    return { valid: false, error: "Conversation ID is required." };
  }

  if (!isNonEmptyString(request.currentUserId)) {
    return { valid: false, error: "Current user ID is required." };
  }

  return { valid: true };
};

export const validateGetMessagesRequest = (
  request: GetMessagesDTO
): ChatValidationResult => {
  if (!isNonEmptyString(request.conversationId)) {
    return { valid: false, error: "Conversation ID is required." };
  }

  return { valid: true };
};

export const validateSendMessageRequest = (
  request: SendMessageDTO
): ChatValidationResult => {
  if (!isNonEmptyString(request.conversationId)) {
    return { valid: false, error: "Conversation ID is required." };
  }

  if (!isNonEmptyString(request.senderId)) {
    return { valid: false, error: "Sender ID is required." };
  }

  if (!isNonEmptyString(request.content)) {
    return { valid: false, error: "Message content cannot be empty." };
  }

  return { valid: true };
};

// Get or create a conversation between two users, optionally linked to a listing.
export const getOrCreateConversation = async (
  currentUserId: string,
  otherUserId: string,
  listingId?: number
): Promise<Conversation> => {
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
    console.error("Error checking existing conversation:", existingError);
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
    console.error("Error creating conversation:", error);
    throw error ?? new Error("Conversation was not created.");
  }

  return data;
};

// Get all conversations for the current user with counterparty profile and full listing.
export const getConversations = async (userId: string): Promise<ConversationWithUser[]> => {
  const { data, error } = await supabase
    .from("Conversations")
    .select("*")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
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
        console.warn("Could not load other user profile for conversation", conv.id, otherUserResult.error);
      }

      if ((listingResult as any).error) {
        console.warn("Could not load listing for conversation", conv.id, (listingResult as any).error);
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

// Get profile and listing details for a specific conversation.
export const getConversationDetails = async (
  conversationId: string,
  currentUserId: string
): Promise<{ otherUser: OtherUserProfile; listing: Listing | null; listingId: number | null }> => {
  const { data: conv, error } = await supabase
    .from("Conversations")
    .select("user1_id, user2_id, listing_id")
    .eq("id", conversationId)
    .single();

  if (error || !conv) {
    console.error("Error fetching conversation details:", error);
    throw error ?? new Error("Conversation not found.");
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

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from("Messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }

  return data ?? [];
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> => {
  const normalizedContent = content.trim();

  const { data, error } = await supabase
    .from("Messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: normalizedContent,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Error sending message:", error);
    throw error ?? new Error("Message was not created.");
  }

  const { error: updateError } = await supabase
    .from("Conversations")
    .update({
      last_message: normalizedContent,
      last_message_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (updateError) {
    console.warn("Failed to update conversation preview:", updateError);
  }

  return data;
};
