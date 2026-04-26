import { ListingRecord } from "@/types/records";
import { useSavedListings } from "@hooks/listings/useSavedListings";
import { useAuth } from "@hooks/general/useAuth";
import { ListingService } from "@services/listings/listingsService";
import { FilterListingsDTO } from "@services/listings/types";
import { filterListings } from "@utils/listingFilters";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

const INITIAL_FILTERS: FilterListingsDTO = {
  minPrice: "",
  maxPrice: "",
  bedrooms: null,
  bathrooms: null,
  sourceFilter: null,
  searchQuery: "",
};

/**
 * Loads the listing feed using TanStack Query, applies client-side search filters,
 * and enriches each record with its saved state.
 */
export const useListings = (initialFilters?: FilterListingsDTO) => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    savedListingIds,
    isLoading: loadingFavourites,
    refreshFavourites,
    toggleFavourite,
  } = useSavedListings();

  const [filters, setFilters] = useState<FilterListingsDTO>(initialFilters || INITIAL_FILTERS);

  const locationFilter = undefined; // All users should see all listings by default regardless of role

  const { data: rawListings = [], isLoading: listingsLoading, refetch } = useQuery({
    queryKey: ["listings", locationFilter, filters.onlySaved],
    queryFn: async () => {
      if (!user) return [];
      
      let data: ListingRecord[];
      if (filters.onlySaved) {
        data = await ListingService.fetchSavedListings(user.userId);
      } else {
        data = await ListingService.fetchListings(locationFilter);
      }
      
      return data;
    },
    enabled: !!user,
  });

  // Applies the saved status to each listing, using the saved listings context
  const enrichedListings = useMemo(() => {
    return rawListings.map(l => {
      const isSaved = savedListingIds.includes(l.id);
      if (l.isSaved === isSaved) return l;
      return { ...l, isSaved };
    });
  }, [rawListings, savedListingIds]);

  const filteredListings = useMemo(() => {
    return filterListings(enrichedListings, { ...filters, savedListingIds });
  }, [enrichedListings, filters, savedListingIds]);

  const updateFilter = useCallback((key: keyof FilterListingsDTO, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearAllFilters = () => setFilters(INITIAL_FILTERS);

  const goToListing = (id: string | number) => {
    router.push(`/listing/${id}`);
  };

  return {
    listings: filteredListings,
    allListings: enrichedListings,
    savedListingIds,
    isLoading: listingsLoading || loadingFavourites,
    refresh: refetch,
    toggleFavourite,
    goToListing,
    filters,
    updateFilter,
    clearAllFilters,
  };
};
