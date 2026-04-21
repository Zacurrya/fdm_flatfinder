import {
    SettingsResponse,
    SupportedCurrency,
    UserCurrencyResponse,
} from "./types";
import * as SettingsService from "./settingsService";

export const getUserCurrency = async (
  userId: string
): Promise<SettingsResponse<UserCurrencyResponse>> => {
  if (!userId) {
    return { success: false, error: "User ID is required." };
  }

  return SettingsService.getUserCurrency(userId);
};

export const upsertUserCurrency = async (
  userId: string,
  currency: SupportedCurrency
): Promise<SettingsResponse> => {
  if (!userId) {
    return { success: false, error: "User ID is required." };
  }

  if (!currency) {
    return { success: false, error: "Currency is required." };
  }

  return SettingsService.upsertUserCurrency(userId, currency);
};
