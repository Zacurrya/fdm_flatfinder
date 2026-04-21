import { OfficeCity, findOfficeCityByName } from "@lib/office-cities";
import * as UserController from "@services/user/userController";
import { useEffect, useState } from "react";

type UserRef = { userId: string; officeLocation?: string } | null;

/**
 * useCityTransfer
 * Manages the office city transfer request lifecycle.
 *
 * @param user     Current user object for ID and current location.
 * @param enabled  Whether the settings panel is currently open/visible.
 * @param onSuccess Async callback invoked after a successful submission (e.g. refreshUser).
 */
export function useCityTransfer(
  user: UserRef,
  enabled: boolean,
  onSuccess: () => Promise<any>
) {
  const [selectedCity, setSelectedCity] = useState<OfficeCity | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isSubmittingCityChange, setIsSubmittingCityChange] = useState(false);
  const [cityError, setCityError] = useState("");
  const [cityMessage, setCityMessage] = useState("");

  useEffect(() => {
    if (!enabled) {
      setCityError("");
      setCityMessage("");
      return;
    }
    const current = findOfficeCityByName(user?.officeLocation ?? "");
    setSelectedCity(current?.city ?? null);
    setSelectedRegion(current?.region ?? "");
  }, [enabled, user?.officeLocation]);

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

    const result = await UserController.requestOfficeLocationChange(user.userId, selectedCity.name);

    if (!result.success) {
      setIsSubmittingCityChange(false);
      setCityError(result.error ?? "Failed to submit request.");
      return;
    }

    await onSuccess();
    setIsSubmittingCityChange(false);
    setCityMessage("Request submitted. Awaiting admin approval.");
  };

  return {
    selectedCity,
    selectedRegion,
    handleSelectCity,
    isSubmittingCityChange,
    cityError,
    cityMessage,
    handleRequestCityChange,
  };
}
