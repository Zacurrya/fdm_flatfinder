import { useAuth } from "@context/AuthContext";
import { fetchListings, Listing } from "@services/listings/listingController";
import { addFavourite, getUserFavourites, removeFavourite } from "@services/user/userController";
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

export function useListings() {
  const { user } = useAuth();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [favIds, setFavIds] = useState<number[]>([]);
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
      const [data, favData] = await Promise.all([
        fetchListings(),
        user?.userId ? getUserFavourites(user.userId) : Promise.resolve({ success: true, data: [] as number[] })
      ]);
      setListings(data);
      setFavIds(favData.success ? favData.data || [] : []);
    } catch (error) {
      console.error("Failed to fetch listings or favourites:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

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

  const toggleFavourite = async (listingId: string | number) => {
    if (!user) return;
    const lId = Number(listingId);
    const isFaved = favIds.includes(lId);
    
    // Optimistic UI
    if (isFaved) {
      setFavIds(prev => prev.filter(id => id !== lId));
      const res = await removeFavourite(user.userId, lId);
      if (!res.success) {
        setFavIds(prev => [...prev, lId]); // Rollback
      }
    } else {
      setFavIds(prev => [...prev, lId]);
      const res = await addFavourite(user.userId, lId);
      if (!res.success) {
        setFavIds(prev => prev.filter(id => id !== lId)); // Rollback
      }
    }
  };

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
    loading,
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
