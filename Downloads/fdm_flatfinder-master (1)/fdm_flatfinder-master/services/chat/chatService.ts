import { supabase } from "../../lib/supabase";
import { Database } from "../../types/database.types";

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

// get or create a conversation between two users (optionally linked to a listing)
export const getOrCreateConversation = async (
  currentUserId: string,
  otherUserId: string,
  listingId?: number
): Promise<Conversation> => {
  const { data: existing } = await supabase
    .from("Conversations")
    .select("*")
    .or(
      `and(user1_id.eq.${currentUserId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${currentUserId})`
    )
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("Conversations")
    .insert({
      user1_id: currentUserId,
      user2_id: otherUserId,
      listing_id: listingId ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }

  return data;
};

// get all conversations for the current user with other user profile + listing snippet
export const getConversations = async (
  userId: string
): Promise<ConversationWithUser[]> => {
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

  const enriched: ConversationWithUser[] = await Promise.all(
    data.map(async (conv) => {
      const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

      const [{ data: otherUser }, listingResult] = await Promise.all([
        supabase
          .from("Users")
          .select("userId, firstName, lastName, profilePicture, phoneNumber, email")
          .eq("userId", otherUserId)
          .single(),
        conv.listing_id
          ? supabase
              .from("Listings")
              .select("id, title, price, rentPeriod, location, photos")
              .eq("id", conv.listing_id)
              .single()
          : Promise.resolve({ data: null }),
      ]);

      return {
        ...conv,
        otherUser: otherUser ?? {
          userId: otherUserId,
          firstName: "Unknown",
          lastName: "",
          profilePicture: null,
          phoneNumber: null,
          email: null,
        },
        listing: (listingResult as any).data ?? null,
      };
    })
  );

  return enriched;
};

// get other user profile + listing details for a single conversation
export const getConversationDetails = async (
  conversationId: string,
  currentUserId: string
): Promise<{ otherUser: OtherUserProfile; listing: ListingSnippet | null }> => {
  const { data: conv, error } = await supabase
    .from("Conversations")
    .select("user1_id, user2_id, listing_id")
    .eq("id", conversationId)
    .single();

  if (error || !conv) throw error ?? new Error("Conversation not found");

  const otherUserId = conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id;

  const [{ data: otherUser }, listingResult] = await Promise.all([
    supabase
      .from("Users")
      .select("userId, firstName, lastName, profilePicture, phoneNumber, email")
      .eq("userId", otherUserId)
      .single(),
    conv.listing_id
      ? supabase
          .from("Listings")
          .select("id, title, price, rentPeriod, location, photos")
          .eq("id", conv.listing_id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  return {
    otherUser: otherUser ?? {
      userId: otherUserId,
      firstName: "Unknown",
      lastName: "",
      profilePicture: null,
      phoneNumber: null,
      email: null,
    },
    listing: (listingResult as any).data ?? null,
  };
};

// get all messages in a conversation
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

  return data || [];
};

// send a message and update the conversation's last_message preview
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> => {
  const { data, error } = await supabase
    .from("Messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }

  await supabase
    .from("Conversations")
    .update({ last_message: content, last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return data;
};

// subscribe to new messages in a conversation via Supabase realtime
export const subscribeToMessages = (
  conversationId: string,
  onNewMessage: (message: Message) => void
) => {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new as Message);
      }
    )
    .subscribe();

  return channel;
};
