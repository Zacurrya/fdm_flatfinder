import { useAuth } from "@hooks/useAuth";
import { useCitySelection } from "@hooks/useCitySelection";
import { UserService } from "@services/user/userService";
import { useEffect, useState } from "react";

/**
 * useUserSettings
 * Consolidates user profile setting changes (e.g., City Transfer requests).
 * Provides a unified interface for profile and settings interactions.
 */
export const useUserSettings = (settingsVisible: boolean = false) => {
  const { user, refreshUser } = useAuth();
  
  const citySelection = useCitySelection();

  const [isSubmittingCityChange, setIsSubmittingCityChange] = useState(false);

  useEffect(() => {
    if (settingsVisible && user?.officeLocation) {
      // Reset state when the settings view becomes visible
      citySelection.resetSelection();
    }
  }, [settingsVisible, user?.officeLocation]);

  const handleRequestCityChange = async () => {
    if (!user?.userId || !citySelection.selectedCity) return;

    if (citySelection.selectedCity.name === user.officeLocation) {
      citySelection.setLocationsError("This is already your city.");
      return;
    }

    citySelection.setLocationsError(null);
    citySelection.setCityMessage("");
    setIsSubmittingCityChange(true);

    const result = await UserService.requestOfficeLocationChange(
      user.userId,
      citySelection.selectedCity.name,
      user.officeLocation
    );

    if (!result.success) {
      setIsSubmittingCityChange(false);
      citySelection.setLocationsError(result.error ?? "Failed to submit request.");
      return;
    }

    await refreshUser();
    setIsSubmittingCityChange(false);
    citySelection.setCityMessage("Request submitted. Awaiting admin approval.");
  };

  return {
    user,
    refreshUser,
    ...citySelection,
    cityError: citySelection.locationsError, // mapped for backwards compatibility
    isSubmittingCityChange,
    handleRequestCityChange,
  };
};
