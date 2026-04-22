import { useSavedListings } from "@hooks/useSavedListings";
import { fetchListings, Listing } from "@services/listings/listingController";
import { filterListings } from "@utils/listingFilters";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

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
 *
 * @returns The filtered listings, all listings, favourite IDs, loading state, and filter setters.
 */
export function useListings() {
  const {
    favIds,
    loadingFavourites,
    refreshFavourites,
    toggleFavourite,
  } = useSavedListings();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [bathrooms, setBathrooms] = useState<number | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [data] = await Promise.all([
        fetchListings(),
        refreshFavourites(),
      ]);
      setListings(data);
    } catch (error) {
      console.error("Failed to fetch listings or favourites:", error);
    } finally {
      setLoading(false);
    }
  }, [refreshFavourites]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
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
    setBathrooms(null);
    setSourceFilter(null);
    setSearchQuery("");
  };

  return {
    listings: filteredListings,
    allListings: listings,
    favIds,
    loading: loading || loadingFavourites,
    refresh: loadData,
    toggleFavourite,
    
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
