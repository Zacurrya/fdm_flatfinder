export type CityChat = {
  id: number;
  city: string;
  created_at: string;
  last_message: string | null;
  last_message_at: string | null;
};

export type CityChatMessage = {
  id: string;
  cityChatId: number;
  senderId: string;
  content: string;
  created_at: string;
  read_at: string | null;
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

export type CityChatResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type GetCityChatByCityDTO = {
  city: string;
};

export type GetCityChatMessagesDTO = {
  cityChatId: number;
};

export type SendCityChatMessageDTO = {
  cityChatId: number;
  senderId: string;
  content: string;
};

export type GetCityChatSenderProfileDTO = {
  senderId: string;
};
