import { Listing } from "@/types/views";
import { useSavedListings } from "@hooks/useSavedListings";
import { ListingService } from "@services/listings/listingsService";
import { filterListings } from "@utils/listingFilters";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@hooks/useAuth";

export type ListingFilterState = {
  minPrice: string;
  maxPrice: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sourceFilter: string | null;
  searchQuery: string;
};

/**
 * useListings
 * Loads the listing feed, applies client-side search filters, and composes saved-listing actions.
 * @returns The filtered listings, all listings, favourite IDs, loading state, and filter setters.
 */
export const useListings = () => {
  const router = useRouter();
  const {
    favIds,
    isLoading: loadingFavourites,
    refreshFavourites,
    toggleFavourite,
  } = useSavedListings();

  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [bathrooms, setBathrooms] = useState<number | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    try {
      const cityFilter = user?.role === "ADMIN" ? undefined : user?.officeLocation;
      const [data] = await Promise.all([
        ListingService.fetchListings(cityFilter),
        refreshFavourites(),
      ]);
      setListings(data);
    } catch (error) {
      console.error("Failed to fetch listings or favourites:", error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshFavourites, user?.role, user?.officeLocation]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      void loadData();
    }, [loadData])
  );

  const filteredListings = useMemo(() => {
    return filterListings(listings, {
      searchQuery,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      sourceFilter,
    });
  }, [listings, searchQuery, minPrice, maxPrice, bedrooms, bathrooms, sourceFilter]);

  const clearAllFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setBedrooms(null);
    setBedrooms(null);
    setSourceFilter(null);
    setSearchQuery("");
  };

  const goToListing = (id: string | number) => {
    router.push(`/listing/${id}`);
  };

  return {
    listings: filteredListings,
    allListings: listings,
    favIds,
    isLoading: isLoading || loadingFavourites,
    refresh: loadData,
    toggleFavourite,
    goToListing,

    // Filter values
    filters: {
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      sourceFilter,
      searchQuery,
    },

    // Filter setters
    setMinPrice,
    setMaxPrice,
    setBedrooms,
    setBathrooms,
    setSourceFilter,
    setSearchQuery,
    clearAllFilters,
  };
}
