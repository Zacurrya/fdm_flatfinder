import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockRequest } from "@mocks/data/requests.json";
import { createRequest, getAllRequests, getUserRequests, hasPendingRequest } from "@services/requests/requestService";
import { resetSupabaseMock } from "../helpers/supabaseMock";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("requestService", () => {
  describe("createRequest", () => {
    test("creates a new request", async () => {
      const requestsMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockRequest, error: null }),
      };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Requests") return requestsMock;
        return {};
      });

      const result = await createRequest({ userId: "user-123", requestType: "CITY_CHANGE", newCity: "Singapore" });

      expect(supabase.from).toHaveBeenCalledWith("Requests");
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(1);
    });
  });

  describe("getAllRequests", () => {
    test("fetches all requests without filters", async () => {
      const requestsMock = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [mockRequest], error: null }),
      };
      const usersMock = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Requests") return requestsMock;
        if (table === "Users") return usersMock;
        if (table === "Listings") return { select: jest.fn().mockReturnThis(), in: jest.fn().mockResolvedValue({ data: [], error: null }) };
        return {};
      });

      const result = await getAllRequests();

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
    });
  });

  describe("getUserRequests", () => {
    test("fetches requests for specific user", async () => {
      const requestsMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [mockRequest], error: null }),
      };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Requests") return requestsMock;
        return {};
      });

      const result = await getUserRequests("user-123");

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
    });
  });

  describe("hasPendingRequest", () => {
    test("returns true if pending request exists", async () => {
      const requestsMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
      };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Requests") return requestsMock;
        return {};
      });

      const result = await hasPendingRequest("user-123", "CITY_CHANGE");

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });
});
