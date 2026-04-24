export type SupportedCurrency = "GBP" | "USD" | "EUR" | "CAD" | "AUD" | "SGD";

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

/**
 * Returns a shortened rent period label.
 * e.g. WEEKLY → "pw", BIWEEKLY → "biwk", MONTHLY → "pcm"
 */
export const getRentLabel = (period: string | null | undefined): string => {
  if (period === "WEEKLY") return "pw";
  if (period === "BIWEEKLY") return "biwk";
  if (period === "MONTHLY") return "pcm";
  return "pw";
};
