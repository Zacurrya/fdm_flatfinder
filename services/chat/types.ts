// Used to load the chat header and fetch participant IDs
export type ChatMetadata = {
  id: string;
  displayName: string | null;
  listingId: string | null;
  listingTitle?: string | null;
  listingPrice?: number | null;
  displayPicture: any | null;
  isGroupChat: boolean;
  participantIds: string[];
  participantCount: number;
};

export type ChatPreview = {
  id: string;
  displayName: string | null;
  listingId: string | null;
  listingTitle?: string | null;
  listingPrice?: number | null;
  displayPicture: any | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessengerId: string | null;
}

// -- DTOs --

export type GetChatsDTO = {
  userId: string;
};

export type GetMessagesDTO = {
  chatId: string;
};

export type CreateChatDTO = {
  participantIds: string[];
  listingId?: string;
};

export type SendMessageDTO = {
  chatId: string;
  senderId: string;
  content: string;
  listingId?: string;
};

export type GetChatMetaDTO = {
  chatId: string;
  currentUserId: string;
};