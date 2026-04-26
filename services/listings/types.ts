import { ListingSource, PropertyType, RentPeriod } from "@/types/enums";

// -- DTOs --

export type FilterListingsDTO = {
  bedrooms?: number | null;
  bathrooms?: number | null;
  minPrice?: string | number | null;
  maxPrice?: string | number | null;
  sourceFilter?: string | null;
  locationId?: string | null;
  searchQuery?: string;
  onlySaved?: boolean;
}

export type CreateListingDTO = {
  userId: string;
  title: string;
  description: string;
  price: number;
  rentPeriod: RentPeriod;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  source: ListingSource;
  photos: string[];
  locationId: string;
  address: string;
};
