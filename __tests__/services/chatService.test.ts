import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockConversation, mockMessage } from "@mocks/data/chat.json";
import { mockConversationRequestDTO } from "@mocks/data/dtos/chatDTO.json";
import {
    getMessages,
    getOrCreateConversation,
    sendMessage,
    validateGetOrCreateConversationRequest
} from "@services/chat/chatService";
import { createResolvedMock, createThenCallbackMock, resetSupabaseMock } from "../helpers/supabaseMock";

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
      const convMock = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        eq: createResolvedMock({ data: [mockConversation], error: null }),
        then: createThenCallbackMock({ data: [mockConversation], error: null })
      };
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
      const messagesMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: createResolvedMock({ data: [mockMessage], error: null }),
      };
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
      const messagesMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: createResolvedMock({ data: mockMessage, error: null }),
      };
      const convMock = {
        update: jest.fn().mockReturnThis(),
        eq: createResolvedMock({ error: null }),
      };

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
});
