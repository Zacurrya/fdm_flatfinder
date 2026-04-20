import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockUserSettings } from "@mocks/data/settings.json";
import { getUserCurrency, upsertUserCurrency } from "@services/settings/settingsService";
import { resetSupabaseMock } from "../helpers/supabaseMock";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("settingsService", () => {
  describe("getUserCurrency", () => {
    test("fetches user currency", async () => {
      const settingsMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: mockUserSettings, error: null }),
      };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "UserSettings") return settingsMock;
        return {};
      });

      const result = await getUserCurrency("user-123");

      expect(supabase.from).toHaveBeenCalledWith("UserSettings");
      expect(result.success).toBe(true);
      expect(result.data?.currency).toBe("GBP");
    });
  });

  describe("upsertUserCurrency", () => {
    test("upserts user currency", async () => {
      const settingsMock = {
        upsert: jest.fn().mockResolvedValue({ error: null }),
      };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "UserSettings") return settingsMock;
        return {};
      });

      const result = await upsertUserCurrency("user-123", "USD");

      expect(supabase.from).toHaveBeenCalledWith("UserSettings");
      expect(settingsMock.upsert).toHaveBeenCalledWith(
        { userId: "user-123", currency: "USD" },
        { onConflict: "userId" }
      );
      expect(result.success).toBe(true);
    });
  });
});
