import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockUser } from "@mocks/data/users.json";
import { addFavourite, getPendingUsers, getUserFavourites, removeFavourite, requestOfficeLocationChange } from "@services/user/userService";
import { resetSupabaseMock } from "../helpers/supabaseMock";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("userService", () => {
  describe("getPendingUsers", () => {
    test("fetches pending users", async () => {
      const pendingUser = { ...mockUser, approvalStatus: "PENDING" };
      const usersMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [pendingUser], error: null }),
      };
      (supabase.from as any).mockImplementation((table: string) => {
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
        single: jest.fn().mockResolvedValue({ data: { officeLocation: "London", role: "CONSULTANT" }, error: null }),
      };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Users") return usersMock;
        return {};
      });

      const result = await requestOfficeLocationChange("user-123", "London");

      expect(result.success).toBe(false);
      expect(result.error).toBe("New city must be different from your current city.");
    });

    test("creates request for consultant", async () => {
      const usersMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { officeLocation: "London", role: "CONSULTANT" }, error: null }),
      };
      const requestsMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      };
      const auditMock = { insert: jest.fn().mockResolvedValue({ error: null }) };

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Users") return usersMock;
        if (table === "Requests") return requestsMock;
        if (table === "AuditLogs") return auditMock;
        return {};
      });

      const result = await requestOfficeLocationChange("user-123", "Singapore");

      expect(result.success).toBe(true);
      expect(requestsMock.insert).toHaveBeenCalled();
      expect(auditMock.insert).toHaveBeenCalled();
    });
  });

  describe("UserFavourites", () => {
    test("adds a favourite", async () => {
      const favouritesMock = { insert: jest.fn().mockResolvedValue({ error: null }) };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "UserFavourites") return favouritesMock;
        return {};
      });

      const result = await addFavourite("user-123", 1);

      expect(favouritesMock.insert).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    test("removes a favourite", async () => {
      const favouritesMock = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn((cb) => Promise.resolve({ error: null }).then(cb))
      };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "UserFavourites") return favouritesMock;
        return {};
      });

      const result = await removeFavourite("user-123", 1);

      expect(favouritesMock.delete).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    test("gets favourites", async () => {
      const favouritesMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [{ listingId: 1 }], error: null }),
      };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "UserFavourites") return favouritesMock;
        return {};
      });

      const result = await getUserFavourites("user-123");

      expect(favouritesMock.select).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([1]);
    });
  });
});
