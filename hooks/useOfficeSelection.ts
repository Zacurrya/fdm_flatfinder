import { OfficeCity, RegionCities } from "@lib/office-cities";
import { LocationService } from "@services/locations/locationService";
import { useEffect, useState } from "react";

export const useOfficeSelection = (initialCity: OfficeCity | null = null, initialRegion: string = "") => {
  const [citiesByRegion, setCitiesByRegion] = useState<RegionCities[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  const [selectedCity, setSelectedCity] = useState<OfficeCity | null>(initialCity);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);

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

  const handleSelectCity = (region: string, city: OfficeCity) => {
    setSelectedRegion(region);
    setSelectedCity(city);
  };

  return {
    citiesByRegion,
    isLoadingLocations,
    locationsError,
    selectedCity,
    selectedRegion,
    handleSelectCity,
    setSelectedCity,
    setSelectedRegion,
  };
};
