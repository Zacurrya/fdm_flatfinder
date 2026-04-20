import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockCreateRequestDTO } from "@mocks/data/dtos/mockCreateRequestDTO.json";
import { mockRequest } from "@mocks/data/requests.json";
import { createRequest, getAllRequests, getUserRequests, hasPendingRequest } from "@services/requests/requestService";
import type { RequestType } from "@services/requests/requestTypes";
import { createResolvedMock, resetSupabaseMock } from "../helpers/supabaseMock";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("requestService", () => {
  const typedCreateRequestDTO = {
    ...mockCreateRequestDTO,
    requestType: mockCreateRequestDTO.requestType as RequestType,
  };

  describe("createRequest", () => {
    test("creates a new request", async () => {
      const requestsMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: createResolvedMock({ data: mockRequest, error: null }),
      };
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Requests") return requestsMock;
        return {};
      });

      const result = await createRequest(typedCreateRequestDTO);

      expect(supabase.from).toHaveBeenCalledWith("Requests");
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(1);
    });
  });

  describe("getAllRequests", () => {
    test("fetches all requests without filters", async () => {
      const requestsMock = {
        select: jest.fn().mockReturnThis(),
        order: createResolvedMock({ data: [mockRequest], error: null }),
      };
      const usersMock = {
        select: jest.fn().mockReturnThis(),
        in: createResolvedMock({ data: [], error: null }),
      };

      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Requests") return requestsMock;
        if (table === "Users") return usersMock;
        if (table === "Listings") return { select: jest.fn().mockReturnThis(), in: createResolvedMock({ data: [], error: null }) };
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
        order: createResolvedMock({ data: [mockRequest], error: null }),
      };
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Requests") return requestsMock;
        return {};
      });

      const result = await getUserRequests(typedCreateRequestDTO.userId);

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
    });
  });

  describe("hasPendingRequest", () => {
    test("returns true if pending request exists", async () => {
      const requestsMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: createResolvedMock({ data: [{ id: 1 }], error: null }),
      };
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Requests") return requestsMock;
        return {};
      });

      const result = await hasPendingRequest(typedCreateRequestDTO.userId, typedCreateRequestDTO.requestType);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });
});
