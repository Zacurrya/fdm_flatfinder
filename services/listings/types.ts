import { ListingSource, PropertyType, RentPeriod } from "@/types/enums";

// Shows in the search listing list
export type ListingPreview = {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  media_urls: string[];
}

// -- DTOs --

export type FilterListingsDTO = {
  bedrooms?: number | null;
  bathrooms?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sources?: ListingSource[];
}

export type CreateListingDTO = {
  userId: string;
  title: string;
  description: string;
  price: number;
  rent_period: RentPeriod;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  source: ListingSource;
  photos: string[];
  city: string;
  address: string;
};
