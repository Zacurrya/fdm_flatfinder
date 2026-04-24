import { useAuth } from "@hooks/useAuth";
import { OfficeCity, RegionCities } from "@lib/office-cities";
import { LocationService } from "@services/locations/locationService";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

/**
 * Consolidated hook for office/city location selection and (optionally) registration flow.
 * If registration is needed, pass enableRegistration=true.
 */
export const useLocationForm = (options?: {
  initialCity?: OfficeCity | null;
  initialRegion?: string;
  enableRegistration?: boolean;
}) => {
  const { register } = useAuth();
  const params = options?.enableRegistration ? useLocalSearchParams<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }>() : undefined;

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

  // -- City selection --
  const [selectedCity, setSelectedCity] = useState<OfficeCity | null>(options?.initialCity ?? null);
  const [selectedRegion, setSelectedRegion] = useState(options?.initialRegion ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectCity = (region: string, city: OfficeCity) => {
    setSelectedRegion(region);
    setSelectedCity(city);
    setErrorMessage("");
  };

  // Optional registration flow
  const handleCompleteSignup = options?.enableRegistration ? async () => {
    if (!selectedCity) {
      setErrorMessage("Please choose your FDM office city before continuing.");
      return;
    }
    setIsSubmitting(true);
    try {
      await register({
        firstName: params?.firstName,
        lastName: params?.lastName,
        email: params?.email,
        password: params?.password,
        phoneNumber: params?.phoneNumber,
        officeLocation: selectedCity.name,
      });
    } catch (error: any) {
      setErrorMessage(error.message ?? "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  } : undefined;

  return {
    // Location list
    citiesByRegion,
    isLoadingLocations,
    locationsError,
    // City selection
    selectedCity,
    selectedRegion,
    setSelectedCity,
    setSelectedRegion,
    handleSelectCity,
    errorMessage,
    setErrorMessage,
    isSubmitting,
    // Registration (if enabled)
    handleCompleteSignup,
  };
};
