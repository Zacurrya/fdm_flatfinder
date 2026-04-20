import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { getUserEmailMapByIds } from "@services/db/userLookup";
import { resetSupabaseMock } from "../helpers/supabaseMock";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("userLookup", () => {
  describe("getUserEmailMapByIds", () => {
    test("returns empty map if no IDs provided", async () => {
      const result = await getUserEmailMapByIds([]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
      expect(supabase.from).not.toHaveBeenCalled();
    });

    test("fetches user emails and maps them properly", async () => {
      const usersMock = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ 
          data: [{ userId: "user-123", email: "test@fdmgroup.com" }], 
          error: null 
        }),
      };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Users") return usersMock;
        return {};
      });

      const result = await getUserEmailMapByIds(["user-123"]);

      expect(supabase.from).toHaveBeenCalledWith("Users");
      expect(result.success).toBe(true);
      expect(result.data?.["user-123"]).toBe("test@fdmgroup.com");
    });
  });
});
