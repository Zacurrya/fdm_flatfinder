import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockConversation, mockMessage } from "@mocks/data/chat.json";
import {
  getMessages,
  getOrCreateConversation,
  sendMessage,
  validateGetOrCreateConversationRequest
} from "@services/chat/chatService";
import { resetSupabaseMock } from "../helpers/supabaseMock";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("chatService", () => {
  describe("Validation", () => {
    test("validateGetOrCreateConversationRequest validation", () => {
      expect(validateGetOrCreateConversationRequest({
        currentUserId: "", otherUserId: "user-456"
      })).toEqual({ valid: false, error: "Current user ID is required." });

      expect(validateGetOrCreateConversationRequest({
        currentUserId: "user-123", otherUserId: "user-123"
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
        eq: jest.fn().mockResolvedValue({ data: [mockConversation], error: null }),
        then: jest.fn((cb) => Promise.resolve({ data: [mockConversation], error: null }).then(cb))
      };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Conversations") return convMock;
        return {};
      });

      const result = await getOrCreateConversation("user-123", "user-456", 1);
      expect(result).toEqual(mockConversation);
    });
  });

  describe("getMessages", () => {
    test("fetches messages", async () => {
      const messagesMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [mockMessage], error: null }),
      };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Messages") return messagesMock;
        return {};
      });

      const result = await getMessages("conv-123");
      expect(result).toEqual([mockMessage]);
    });
  });

  describe("sendMessage", () => {
    test("sends message and updates conversation", async () => {
      const messagesMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockMessage, error: null }),
      };
      const convMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Messages") return messagesMock;
        if (table === "Conversations") return convMock;
        return {};
      });

      const result = await sendMessage("conv-123", "user-123", "Hello");
      expect(messagesMock.insert).toHaveBeenCalled();
      expect(convMock.update).toHaveBeenCalled();
      expect(result).toEqual(mockMessage);
    });
  });
});
