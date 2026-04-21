import { Database } from "@/types/database.types";

export type ListingLocationRow = Database["public"]["Tables"]["ListingLocations"]["Row"];

export type Listing = Database["public"]["Tables"]["Listings"]["Row"] & {
  ListingLocations?: ListingLocationRow | null;
};

export type InsertListing = Database["public"]["Tables"]["Listings"]["Insert"];

export type ListingIdDTO = {
  id: number | string;
};

export type UploadListingPhotoDTO = {
  uri: string;
};

export type CreateListingDTO = {
  listing: InsertListing;
  city: string;
  address: string;
};
