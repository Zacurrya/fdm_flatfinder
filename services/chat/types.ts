import { Database } from "@/types/database.types";

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

export type ChatResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type GetOrCreateConversationDTO = {
  currentUserId: string;
  otherUserId: string;
  listingId?: number;
};

export type GetConversationsDTO = {
  userId: string;
};

export type GetConversationDetailsDTO = {
  conversationId: string;
  currentUserId: string;
};

export type GetMessagesDTO = {
  conversationId: string;
};

export type SendMessageDTO = {
  conversationId: string;
  senderId: string;
  content: string;
};

export type SubscribeToMessagesDTO = {
  conversationId: string;
  onNewMessage: (message: Message) => void;
};
