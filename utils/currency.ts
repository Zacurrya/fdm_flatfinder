import { SupportedCurrency } from "@services/settings/types";

const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  CAD: "C$",
  AUD: "A$",
  SGD: "S$",
};

export const getCurrencySymbol = (
  currency: SupportedCurrency | null | undefined = "GBP"
): string => {
  if (!currency) {
    return CURRENCY_SYMBOLS.GBP;
  }

  return CURRENCY_SYMBOLS[currency] ?? CURRENCY_SYMBOLS.GBP;
};

export const formatCurrencyWithSymbol = (
  amount: number | string,
  currency: SupportedCurrency | null | undefined = "GBP"
): string => {
  return `${getCurrencySymbol(currency)}${amount}`;
};

/**
 * Centrally formats listing prices with currency symbol and period suffix.
 * Ensures consistent styling across all screens.
 */
export const formatListingPrice = (
  price: number | string,
  period?: string | null,
  currency: SupportedCurrency | null | undefined = "GBP"
): string => {
  const amount = formatCurrencyWithSymbol(price, currency);
  let suffix = "/pcm"; // default to pcm

  if (period === "WEEKLY") {
    suffix = "/pw";
  } else if (period === "BIWEEKLY") {
    suffix = "/biwk";
  }

  return `${amount}${suffix}`;
};
