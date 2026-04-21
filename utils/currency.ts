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
