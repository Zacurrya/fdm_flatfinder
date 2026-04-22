import * as SettingsService from "./settingsService";
import {
  SettingsResponse,
  SupportedCurrency,
  UserCurrencyResponse,
} from "./types";

/**
 * getUserCurrency
 * Loads the saved currency preference for a user.
 *
 * @param userId The user ID to look up.
 * @returns A settings response containing the user's currency preference.
 */
export const getUserCurrency = async (
  userId: string
): Promise<SettingsResponse<UserCurrencyResponse>> => {
  if (!userId) {
    return { success: false, error: "User ID is required." };
  }

  return SettingsService.getUserCurrency(userId);
};

/**
 * upsertUserCurrency
 * Saves or updates a user's currency preference.
 *
 * @param userId The user ID to update.
 * @param currency The selected currency code.
 * @returns A settings response for the save operation.
 */
export const upsertUserCurrency = async (
  userId: string,
  currency: SupportedCurrency
): Promise<SettingsResponse> => {
  if (!userId) {
    return { success: false, error: "User ID is required." };
  }

  return SettingsService.upsertUserCurrency(userId, currency);
};
