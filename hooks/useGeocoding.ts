import { MapService } from "@services/map/mapService";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

/**
 * useGeocoding Hook
 * Manages the state of geocoding an address into a map region using TanStack Query.
 */
export const useGeocoding = (address: string) => {
  const { data: location, isLoading, error } = useQuery({
    queryKey: ["geocoding", address],
    queryFn: () => MapService.geocodeAddress(address),
    enabled: !!address,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours for geocoding results
  });

  const region = useMemo(() => {
    if (!location) return null;
    return {
      latitude: location.lat,
      longitude: location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [location]);

  return { 
    region, 
    isLoading: !!address && isLoading, 
    error: error instanceof Error ? error.message : null 
  };
};
