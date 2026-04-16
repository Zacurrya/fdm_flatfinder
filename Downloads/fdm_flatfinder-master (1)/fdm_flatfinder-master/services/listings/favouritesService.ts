import { supabase } from "../../lib/supabase";
import { Listing } from "./listingsService";

export type Favourite = {
  id: number;
  userId: string;
  listingId: number;
  created_at: string;
};

// get all favourite listings for a user (returns full listing objects)
export const fetchFavourites = async (userId: string): Promise<Listing[]> => {
  const { data, error } = await supabase
    .from("Favourites")
    .select("listingId, Listings(*)")
    .eq("userId", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching favourites:", error);
    throw error;
  }

  return (data ?? []).map((row: any) => row.Listings).filter(Boolean);
};

// check if a listing is favourited by the current user
export const isFavourited = async (userId: string, listingId: number): Promise<boolean> => {
  const { data } = await supabase
    .from("Favourites")
    .select("id")
    .eq("userId", userId)
    .eq("listingId", listingId)
    .maybeSingle();

  return !!data;
};

// add a favourite
export const addFavourite = async (userId: string, listingId: number): Promise<void> => {
  const { error } = await supabase
    .from("Favourites")
    .insert({ userId, listingId });

  if (error) {
    console.error("Error adding favourite:", error);
    throw error;
  }
};

// remove a favourite
export const removeFavourite = async (userId: string, listingId: number): Promise<void> => {
  const { error } = await supabase
    .from("Favourites")
    .delete()
    .eq("userId", userId)
    .eq("listingId", listingId);

  if (error) {
    console.error("Error removing favourite:", error);
    throw error;
  }
};
