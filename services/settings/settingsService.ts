import { supabase } from "@lib/supabase";
import {
    SettingsResponse,
    SupportedCurrency,
    UserCurrencyResponse,
} from "./types";

export const getUserCurrency = async (userId: string): Promise<SettingsResponse<UserCurrencyResponse>> => {
  const { data, error } = await supabase
    .from("UserSettings")
    .select("currency")
    .eq("userId", userId)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  const currency = (data?.currency ?? null) as SupportedCurrency | null;
  return { success: true, data: { currency } };
};

export const upsertUserCurrency = async (
  userId: string,
  currency: SupportedCurrency
): Promise<SettingsResponse> => {
  const { error } = await supabase
    .from("UserSettings")
    .upsert({ userId, currency }, { onConflict: "userId" });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};
