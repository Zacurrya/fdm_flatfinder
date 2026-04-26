import { OfficeCity, RegionCities } from "@/types/locations";
import { LocationService } from "@services/locations/locationService";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Manages the selection state of office locations, utilizing LocationService for grouped data.
 */
export const useCitySelection = () => {
  const { data: citiesByRegion = [], isLoading: isLoadingLocations, error: locationsFetchError } = useQuery<RegionCities[]>({
    queryKey: ["locations", "grouped"],
    queryFn: () => LocationService.getCitiesByRegion(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const [selectedCity, setSelectedCity] = useState<OfficeCity | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [cityMessage, setCityMessage] = useState("");
  const [locationsError, setLocationsError] = useState<string | null>(null);

  const handleSelectCity = (region: string, city: OfficeCity | null) => {
    setSelectedRegion(region);
    setSelectedCity(city);
    setLocationsError(null);
    setCityMessage("");
  };

  const resetSelection = () => {
    setSelectedCity(null);
    setSelectedRegion("");
    setLocationsError(null);
    setCityMessage("");
  };

  const currentError = locationsError || (locationsFetchError instanceof Error ? locationsFetchError.message : null);

  return {
    // Data
    citiesByRegion,
    isLoadingLocations,

    // Error / Messaging State
    locationsError: currentError,
    setLocationsError,
    cityMessage,
    setCityMessage,

    // Selection State
    selectedCity,
    selectedRegion,
    handleSelectCity,
    resetSelection,
  };
};
