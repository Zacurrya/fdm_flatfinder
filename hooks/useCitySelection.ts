import { OfficeCity, RegionCities } from "@/types/locations";
import { LocationService } from "@services/locations/locationService";
import { useEffect, useState } from "react";

/**
 * Consolidates city fetching and selection state for forms and settings.
 */
export const useCitySelection = () => {
  const [citiesByRegion, setCitiesByRegion] = useState<RegionCities[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  const [selectedCity, setSelectedCity] = useState<OfficeCity | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [cityMessage, setCityMessage] = useState("");

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

  return {
    // Data
    citiesByRegion,
    isLoadingLocations,

    // Error / Messaging State
    locationsError,
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
