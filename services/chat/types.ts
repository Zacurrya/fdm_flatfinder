import { Database } from "@/types/database.types";
import { Listing } from "@services/listings/listingController";

export type Chat = Database["public"]["Tables"]["Conversations"]["Row"];
export type Message = Database["public"]["Tables"]["Messages"]["Row"];

export type OtherUserProfile = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  phoneNumber: string | null;
  email: string | null;
};

export type ChatWithUser = Chat & {
  otherUser: OtherUserProfile;
  listing: Listing | null;
};

export type ChatValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export type ChatResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type GetOrCreateChatDTO = {
  currentUserId: string;
  otherUserId: string;
  listingId?: number;
};

export type GetChatsDTO = {
  userId: string;
};

export type GetChatDetailsDTO = {
  chatId: string;
  currentUserId: string;
};

export type GetChatMessagesDTO = {
  chatId: string;
};

export type SendChatMessageDTO = {
  chatId: string;
  senderId: string;
  content: string;
};
