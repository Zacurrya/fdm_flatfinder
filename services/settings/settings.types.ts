import { AuthResponse } from "@services/auth/auth.types";

export type SupportedCurrency = "GBP" | "USD" | "EUR" | "CAD" | "AUD" | "SGD";

export const supportedCurrencies: SupportedCurrency[] = ["GBP", "USD", "EUR", "CAD", "AUD", "SGD"];

export interface UserCurrencyResponse {
  currency: SupportedCurrency | null;
}

export interface UpdateUserCurrencyDTO {
  userId: string;
  currency: SupportedCurrency;
}

export type SettingsResponse<T = undefined> = AuthResponse<T>;
