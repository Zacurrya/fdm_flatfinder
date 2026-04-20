import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockUserLookupDTO } from "@mocks/data/dtos/userLookupDTO.json";
import { getUserEmailMapByIds } from "@services/user/userService";
import { createResolvedMock, resetSupabaseMock } from "../helpers/supabaseMock";

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
        in: createResolvedMock({
          data: [{ userId: "user-123", email: "test@fdmgroup.com" }],
          error: null
        }),
      };
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Users") return usersMock;
        return {};
      });

      const result = await getUserEmailMapByIds(mockUserLookupDTO.userIds);

      expect(supabase.from).toHaveBeenCalledWith("Users");
      expect(result.success).toBe(true);
      expect(result.data?.[mockUserLookupDTO.userIds[0]]).toBe(mockUserLookupDTO.expectedEmail);
    });
  });
});
