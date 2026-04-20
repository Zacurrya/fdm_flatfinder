import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockUserCurrencyDTO } from "@mocks/data/dtos/settingsDTO.json";
import { mockUserSettings } from "@mocks/data/settings.json";
import type { SupportedCurrency } from "@services/settings/settings.types";
import { getUserCurrency, upsertUserCurrency } from "@services/settings/settingsService";
import { createResolvedMock, resetSupabaseMock } from "../helpers/supabaseMock";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("settingsService", () => {
  const typedCurrency = mockUserCurrencyDTO.currency as SupportedCurrency;

  describe("getUserCurrency", () => {
    test("fetches user currency", async () => {
      const settingsMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: createResolvedMock({ data: mockUserSettings, error: null }),
      };
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "UserSettings") return settingsMock;
        return {};
      });

      const result = await getUserCurrency(mockUserCurrencyDTO.userId);

      expect(supabase.from).toHaveBeenCalledWith("UserSettings");
      expect(result.success).toBe(true);
      expect(result.data?.currency).toBe("GBP");
    });
  });

  describe("upsertUserCurrency", () => {
    test("upserts user currency", async () => {
      const settingsMock = {
        upsert: createResolvedMock({ error: null }),
      };
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "UserSettings") return settingsMock;
        return {};
      });

      const result = await upsertUserCurrency(
        mockUserCurrencyDTO.userId,
        typedCurrency
      );

      expect(supabase.from).toHaveBeenCalledWith("UserSettings");
      expect(settingsMock.upsert).toHaveBeenCalledWith(
        {
          userId: mockUserCurrencyDTO.userId,
          currency: typedCurrency,
        },
        { onConflict: "userId" }
      );
      expect(result.success).toBe(true);
    });
  });
});
