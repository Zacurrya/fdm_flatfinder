import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockConversationRequestDTO } from "@mocks/data/dtos/chatDTO.json";
import { mockConversation, mockMessage } from "@mocks/data/entities/chat.json";
import {
  getMessages,
  getOrCreateConversation,
  sendMessage,
  validateGetOrCreateConversationRequest
} from "@services/chat/chatService";
import { mockConversationsTable, mockMessagesTable, resetSupabaseMock } from "../helpers/supabase";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("chatService", () => {
  describe("Validation", () => {
    test("validateGetOrCreateConversationRequest validation", () => {
      const missingCurrentUserValidationDTO = {
        ...mockConversationRequestDTO,
        currentUserId: "",
      };
      expect(validateGetOrCreateConversationRequest({
        currentUserId: missingCurrentUserValidationDTO.currentUserId,
        otherUserId: missingCurrentUserValidationDTO.otherUserId,
      })).toEqual({ valid: false, error: "Current user ID is required." });

      const sameUserValidationDTO = {
        ...mockConversationRequestDTO,
        otherUserId: mockConversationRequestDTO.currentUserId,
      };
      expect(validateGetOrCreateConversationRequest({
        currentUserId: sameUserValidationDTO.currentUserId,
        otherUserId: sameUserValidationDTO.otherUserId,
      })).toEqual({ valid: false, error: "You cannot start a conversation with yourself." });
    });
  });

  describe("getOrCreateConversation", () => {
    test("returns existing conversation if found", async () => {
      const convMock = mockConversationsTable([mockConversation]);
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Conversations") return convMock;
        return {};
      });

      const result = await getOrCreateConversation(
        mockConversationRequestDTO.currentUserId,
        mockConversationRequestDTO.otherUserId,
        mockConversationRequestDTO.listingId
      );
      expect(result).toEqual(mockConversation);
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

      const result = await getMessages(mockConversationRequestDTO.conversationId);
      expect(result).toEqual([mockMessage]);
    });
  });

  describe("sendMessage", () => {
    test("sends message and updates conversation", async () => {
      const messagesMock = mockMessagesTable(mockMessage);
      const convMock = mockConversationsTable([]);

      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Messages") return messagesMock;
        if (table === "Conversations") return convMock;
        return {};
      });

      const result = await sendMessage(
        mockConversationRequestDTO.conversationId,
        mockConversationRequestDTO.currentUserId,
        mockConversationRequestDTO.message
      );
      expect(messagesMock.insert).toHaveBeenCalled();
      expect(convMock.update).toHaveBeenCalled();
      expect(result).toEqual(mockMessage);
    });
  });
});function asAsyncMock<T>(fn: any) {
  return fn as jest.MockedFunction<(...args: any[]) => Promise<T>>;
}
