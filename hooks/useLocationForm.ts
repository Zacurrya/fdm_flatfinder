import { useAuth } from "@hooks/useAuth";
import { useCitySelection } from "@hooks/useCitySelection";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

/**
 * useOfficeLocations
 * Handles the registration signup-flow logic using the consolidated city selection hook.
 */
export const useOfficeLocations = () => {
  const { register } = useAuth();

  const citySelection = useCitySelection();

  // Receive form data passed from the register step as route params
  const params = useLocalSearchParams<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCompleteSignUp = async () => {
    if (!citySelection.selectedCity) {
      citySelection.setLocationsError("Please choose your FDM office city before continuing.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        password: params.password,
        phoneNumber: params.phoneNumber,
        officeLocation: citySelection.selectedCity.id,
      });

    } catch (error: any) {
      citySelection.setLocationsError(error.message ?? "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ...citySelection,
    errorMessage: citySelection.locationsError, // Map to old name for backwards compatibility
    isSubmitting,
    handleCompleteSignUp,
  };
};
