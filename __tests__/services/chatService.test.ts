import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockChatRequestDTO } from "@mocks/data/dtos/chatDTO.json";
import { mockChat, mockMessage } from "@mocks/data/entities/chat.json";
import {
  getMessages,
  getOrCreateChat,
  sendMessage,
  validateGetOrCreateChatRequest
} from "@services/chat/chatService";
import { mockConversationsTable, mockMessagesTable, resetSupabaseMock } from "../helpers/supabase";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("chatService", () => {
  describe("Validation", () => {
    test("validateGetOrCreateChatRequest validation", () => {
      const missingCurrentUserValidationDTO = {
        ...mockChatRequestDTO,
        currentUserId: "",
      };
      expect(validateGetOrCreateChatRequest({
        currentUserId: missingCurrentUserValidationDTO.currentUserId,
        otherUserId: missingCurrentUserValidationDTO.otherUserId,
      })).toEqual({ valid: false, error: "Current user ID is required." });

      const sameUserValidationDTO = {
        ...mockChatRequestDTO,
        otherUserId: mockChatRequestDTO.currentUserId,
      };
      expect(validateGetOrCreateChatRequest({
        currentUserId: sameUserValidationDTO.currentUserId,
        otherUserId: sameUserValidationDTO.otherUserId,
      })).toEqual({ valid: false, error: "You cannot start a chat with yourself." });
    });
  });

  describe("getOrCreateChat", () => {
    test("returns existing chat if found", async () => {
      const chatMock = mockConversationsTable([mockChat]);
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Conversations") return chatMock;
        return {};
      });

      const result = await getOrCreateChat(
        mockChatRequestDTO.currentUserId,
        mockChatRequestDTO.otherUserId,
        mockChatRequestDTO.listingId
      );
      expect(result).toEqual(mockChat);
    });
  });

  describe("getMessages", () => {
    test("fetches messages", async () => {
      const messagesMock = mockMessagesTable([mockMessage]);
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Messages") return messagesMock;
        return {};
      });

      const result = await getMessages(mockChatRequestDTO.chatId);
      expect(result).toEqual([mockMessage]);
    });
  });

  describe("sendMessage", () => {
    test("sends message and updates chat", async () => {
      const messagesMock = mockMessagesTable(mockMessage);
      const chatMock = mockConversationsTable([]);

      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Messages") return messagesMock;
        if (table === "Conversations") return chatMock;
        return {};
      });

      const result = await sendMessage(
        mockChatRequestDTO.chatId,
        mockChatRequestDTO.currentUserId,
        mockChatRequestDTO.message
      );
      expect(messagesMock.insert).toHaveBeenCalled();
      expect(chatMock.update).toHaveBeenCalled();
      expect(result).toEqual(mockMessage);
    });
  });
});function asAsyncMock<T>(fn: any) {
  return fn as jest.MockedFunction<(...args: any[]) => Promise<T>>;
}
