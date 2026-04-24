import { useAuth } from "@hooks/useAuth";
import { OfficeCity, RegionCities } from "@lib/office-cities";
import { LocationService } from "@services/locations/locationService";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

/**
 * Combines location fetching with the registration signup-flow logic.
 */
export const useOfficeLocations = () => {
  const { register } = useAuth();

  // Receive form data passed from the register step as route params
  const params = useLocalSearchParams<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }>();

  // -- Location list --
  const [citiesByRegion, setCitiesByRegion] = useState<RegionCities[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await LocationService.getCitiesByRegion();
        setCitiesByRegion(data);
      } catch (err: any) {
        setLocationsError(err.message ?? "Failed to load locations");
      } finally {
        setIsLoadingLocations(false);
      }
    };

    void fetchLocations();
  }, []);

  // -- City selection & signup flow --
  const [selectedCity, setSelectedCity] = useState<OfficeCity | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectCity = (region: string, city: OfficeCity) => {
    setSelectedRegion(region);
    setSelectedCity(city);
    setErrorMessage("");
  };

  const handleCompleteSignup = async () => {
    if (!selectedCity) {
      setErrorMessage("Please choose your FDM office city before continuing.");
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
        officeLocation: selectedCity.name,
      });

    } catch (error: any) {
      setErrorMessage(error.message ?? "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Location list
    citiesByRegion,
    isLoadingLocations,
    locationsError,
    // City selection
    selectedCity,
    selectedRegion,
    errorMessage,
    isSubmitting,
    handleSelectCity,
    handleCompleteSignup,
  };
};
