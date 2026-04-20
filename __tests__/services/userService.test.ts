import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockCityChangeDTO } from "@mocks/data/dtos/cityChangeDTO.json";
import { mockUser } from "@mocks/data/users.json";
import { addFavourite, getPendingUsers, getUserFavourites, getUserProfile, removeFavourite, requestOfficeLocationChange } from "@services/user/userService";
import { createResolvedMock, createThenCallbackMock, resetSupabaseMock } from "../helpers/supabaseMock";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("userService", () => {
  describe("getUserProfile", () => {
    test("fetches user profile", async () => {
      const usersMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: createResolvedMock({ data: mockUser, error: null }),
      };
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Users") return usersMock;
        return {};
      });

      const result = await getUserProfile(mockCityChangeDTO.userId);

      expect(supabase.from).toHaveBeenCalledWith("Users");
      expect(result.success).toBe(true);
      expect(result.data?.userId).toBe("user-123");
    });
  });

  describe("getPendingUsers", () => {
    test("fetches pending users", async () => {
      const pendingUser = { ...mockUser, approvalStatus: "PENDING" };
      const usersMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: createResolvedMock({ data: [pendingUser], error: null }),
      };
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Users") return usersMock;
        return {};
      });

      const result = await getPendingUsers();

      expect(supabase.from).toHaveBeenCalledWith("Users");
      expect(result.success).toBe(true);
      expect(result.data?.[0].approvalStatus).toBe("PENDING");
    });
  });

  describe("requestOfficeLocationChange", () => {
    test("fails if city is the same as current", async () => {
      const usersMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: createResolvedMock({ data: { officeLocation: "London", role: "CONSULTANT" }, error: null }),
      };
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Users") return usersMock;
        return {};
      });

      const sameCityRequest = {
        ...mockCityChangeDTO,
        newCity: "London",
      };
      const result = await requestOfficeLocationChange(sameCityRequest.userId, sameCityRequest.newCity);

      expect(result.success).toBe(false);
      expect(result.error).toBe("New city must be different from your current city.");
    });

    test("creates request for consultant", async () => {
      const usersMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: createResolvedMock({ data: { officeLocation: "London", role: "CONSULTANT" }, error: null }),
      };
      const requestsMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: createResolvedMock({ data: [], error: null }),
        insert: createResolvedMock({ error: null }),
      };
      const auditMock = { insert: createResolvedMock({ error: null }) };

      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Users") return usersMock;
        if (table === "Requests") return requestsMock;
        if (table === "AuditLogs") return auditMock;
        return {};
      });

      const result = await requestOfficeLocationChange(mockCityChangeDTO.userId, mockCityChangeDTO.newCity);

      expect(result.success).toBe(true);
      expect(requestsMock.insert).toHaveBeenCalled();
      expect(auditMock.insert).toHaveBeenCalled();
    });
  });

  describe("UserFavourites", () => {
    test("adds a favourite", async () => {
      const favouritesMock = { insert: createResolvedMock({ error: null }) };
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "UserFavourites") return favouritesMock;
        return {};
      });

      const result = await addFavourite(mockCityChangeDTO.userId, 1);

      expect(favouritesMock.insert).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    test("removes a favourite", async () => {
      const favouritesMock = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: createThenCallbackMock({ error: null })
      };
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "UserFavourites") return favouritesMock;
        return {};
      });

      const result = await removeFavourite(mockCityChangeDTO.userId, 1);

      expect(favouritesMock.delete).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    test("gets favourites", async () => {
      const favouritesMock = {
        select: jest.fn().mockReturnThis(),
        eq: createResolvedMock({ data: [{ listingId: 1 }], error: null }),
      };
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "UserFavourites") return favouritesMock;
        return {};
      });

      const result = await getUserFavourites(mockCityChangeDTO.userId);

      expect(favouritesMock.select).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([1]);
    });
  });
});
