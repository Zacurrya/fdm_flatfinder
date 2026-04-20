import { supabase } from "@lib/supabase";
import { Database } from "@/types/database.types";
import { isNonEmptyString, isPositiveInteger } from "@utils/validation";

export type Conversation = Database["public"]["Tables"]["Conversations"]["Row"];
export type Message = Database["public"]["Tables"]["Messages"]["Row"];

export type OtherUserProfile = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  phoneNumber: string | null;
  email: string | null;
};

export type ListingSnippet = {
  id: number;
  title: string;
  price: number;
  rentPeriod: string;
  location: string;
  photos: string[] | null;
};

export type ConversationWithUser = Conversation & {
  otherUser: OtherUserProfile;
  listing: ListingSnippet | null;
};

export type ChatValidationResult =
  | { valid: true }
  | { valid: false; error: string };

type GetOrCreateConversationRequest = {
  currentUserId: string;
  otherUserId: string;
  listingId?: number;
};

type GetConversationsRequest = {
  userId: string;
};

type GetConversationDetailsRequest = {
  conversationId: string;
  currentUserId: string;
};

type GetMessagesRequest = {
  conversationId: string;
};

type SendMessageRequest = {
  conversationId: string;
  senderId: string;
  content: string;
};


export const validateGetOrCreateConversationRequest = (
  request: GetOrCreateConversationRequest
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
  request: GetConversationsRequest
): ChatValidationResult => {
  if (!isNonEmptyString(request.userId)) {
    return { valid: false, error: "User ID is required." };
  }

  return { valid: true };
};

export const validateGetConversationDetailsRequest = (
  request: GetConversationDetailsRequest
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
  request: GetMessagesRequest
): ChatValidationResult => {
  if (!isNonEmptyString(request.conversationId)) {
    return { valid: false, error: "Conversation ID is required." };
  }

  return { valid: true };
};

export const validateSendMessageRequest = (
  request: SendMessageRequest
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

const toListingSnippet = (row: any): ListingSnippet | null => {
  if (!row) return null;

  const listingLocation = Array.isArray(row.ListingLocations)
    ? row.ListingLocations[0]
    : row.ListingLocations;

  return {
    id: row.id,
    title: row.title,
    price: row.price,
    rentPeriod: row.rentPeriod,
    location: listingLocation?.address ?? listingLocation?.city ?? "Location unavailable",
    photos: Array.isArray(row.photos) ? row.photos : null,
  };
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

// Get all conversations for the current user with counterparty profile and listing snippet.
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
            .select("id, title, price, rentPeriod, photos, ListingLocations(address, city)")
            .eq("id", conv.listing_id)
            .single()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (otherUserResult.error) {
        console.warn("Could not load other user profile for conversation", conv.id, otherUserResult.error);
      }

      if ((listingResult as any).error) {
        console.warn("Could not load listing snippet for conversation", conv.id, (listingResult as any).error);
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
        listing: toListingSnippet((listingResult as any).data),
      };
    })
  );

  return enriched;
};

// Get profile and listing details for a specific conversation.
export const getConversationDetails = async (
  conversationId: string,
  currentUserId: string
): Promise<{ otherUser: OtherUserProfile; listing: ListingSnippet | null }> => {
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
        .select("id, title, price, rentPeriod, photos, ListingLocations(address, city)")
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
    listing: toListingSnippet((listingResult as any).data),
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
