// Used to load the chat header and fetch participant IDs
export type ChatMetadata = {
  id: string;
  displayName: string | null;
  listingId: string | null;
  displayPicture: string | null;
  isGroupChat: boolean;
  participantIds: string[];
  participantCount: number;
};

export type ChatPreview = {
  id: string;
  displayName: string | null;
  listingId: string | null;
  displayPicture: string | null;
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
  listingId?: number;
};

export type GetChatMetaDTO = {
  chatId: string;
  currentUserId: string;
};