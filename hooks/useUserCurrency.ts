import * as SettingsController from "@services/settings/settingsController";
import { SupportedCurrency } from "@services/settings/types";
import { useEffect, useState } from "react";

/**
 * useUserCurrency
 * Manages the currency preference load/save lifecycle.
 * Extracted from SettingsModal to keep the modal as a thin layout shell.
 *
 * @param userId  The current user's ID. Pass undefined when not yet available.
 * @param enabled Whether the settings panel is currently open/visible.
 */
export function useUserCurrency(userId: string | undefined, enabled: boolean) {
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>("GBP");
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(false);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [currencyError, setCurrencyError] = useState("");
  const [currencyMessage, setCurrencyMessage] = useState("");

  useEffect(() => {
    if (!enabled) {
      setIsCurrencyDropdownOpen(false);
      setCurrencyError("");
      setCurrencyMessage("");
      return;
    }

    if (!userId) return;

    setIsLoadingCurrency(true);
    SettingsController.getUserCurrency(userId)
      .then((result) => {
        if (result.success) {
          setSelectedCurrency(result.data?.currency ?? "GBP");
        }
      })
      .finally(() => setIsLoadingCurrency(false));
  }, [enabled, userId]);

  const handleSaveCurrency = async () => {
    if (!userId) return;
    setCurrencyError("");
    setCurrencyMessage("");
    setIsSavingCurrency(true);

    const result = await SettingsController.upsertUserCurrency(userId, selectedCurrency);
    setIsSavingCurrency(false);

    if (!result.success) {
      setCurrencyError(result.error ?? "Failed to update currency.");
      return;
    }

    setCurrencyMessage("Currency preference updated.");
  };

  return {
    selectedCurrency,
    setSelectedCurrency,
    isCurrencyDropdownOpen,
    setIsCurrencyDropdownOpen,
    isLoadingCurrency,
    isSavingCurrency,
    currencyError,
    currencyMessage,
    handleSaveCurrency,
  };
}
