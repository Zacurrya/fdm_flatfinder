import { useAuth } from "@hooks/useAuth";
import { OfficeCity } from "@lib/office-cities";
import { UserService } from "@services/user/userService";
import { useEffect, useState } from "react";

/**
 * useUserSettings
 * Consolidates user profile setting changes (e.g., City Transfer requests).
 * Provides a unified interface for profile and settings interactions.
 */
export const useUserSettings = (settingsVisible: boolean = false) => {
  const { user, refreshUser } = useAuth();

  // City Transfer State
  const [selectedCity, setSelectedCity] = useState<OfficeCity | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [isSubmittingCityChange, setIsSubmittingCityChange] = useState(false);
  const [cityError, setCityError] = useState("");
  const [cityMessage, setCityMessage] = useState("");

  useEffect(() => {
    if (settingsVisible && user?.officeLocation) {
      // Reset state when the settings view becomes visible
      setSelectedCity(null);
      setSelectedRegion("");
      setCityError("");
      setCityMessage("");
    }
  }, [settingsVisible, user?.officeLocation]);

  const handleSelectCity = (region: string, city: OfficeCity | null) => {
    setSelectedRegion(region);
    setSelectedCity(city);
    setCityError("");
    setCityMessage("");
  };

  const handleRequestCityChange = async () => {
    if (!user?.userId || !selectedCity) return;

    if (selectedCity.name === user.officeLocation) {
      setCityError("This is already your city.");
      return;
    }

    setCityError("");
    setCityMessage("");
    setIsSubmittingCityChange(true);

    const result = await UserService.requestOfficeLocationChange(
      user.userId,
      selectedCity.name,
      user.officeLocation
    );

    if (!result.success) {
      setIsSubmittingCityChange(false);
      setCityError(result.error ?? "Failed to submit request.");
      return;
    }

    await refreshUser();
    setIsSubmittingCityChange(false);
    setCityMessage("Request submitted. Awaiting admin approval.");
  };

  return {
    user,
    refreshUser,
    // City Transfer state & actions
    selectedCity,
    selectedRegion,
    handleSelectCity,
    isSubmittingCityChange,
    cityError,
    cityMessage,
    handleRequestCityChange,
  };
};
