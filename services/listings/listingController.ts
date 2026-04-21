export * from "./types";
import {
  CreateListingDTO,
  InsertListing,
  Listing,
  ListingIdDTO,
  UploadListingPhotoDTO,
} from "./types";
import {
  createListing as createListingService,
  deleteListing as deleteListingService,
  fetchListingById as fetchListingByIdService,
  fetchListings as fetchListingsService,
  uploadListingPhoto as uploadListingPhotoService,
} from "./listingsService";

function ensureValidListingId(id: number | string): number {
  const num = Number(id);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error("Invalid listing ID.");
  }
  return num;
}

function ensureNonEmpty(value: string, fieldName: string): string {
  const trimmed = value?.trim?.() ?? "";
  if (!trimmed) {
    throw new Error(`${fieldName} is required.`);
  }

  return trimmed;
}

export const fetchListings = async (): Promise<Listing[]> => {
  return fetchListingsService();
};

export const fetchListingById = async (dto: ListingIdDTO): Promise<Listing> => {
  const listingId = ensureValidListingId(dto.id);
  return fetchListingByIdService(listingId);
};

export const deleteListing = async (dto: ListingIdDTO): Promise<void> => {
  const listingId = ensureValidListingId(dto.id);
  return deleteListingService(listingId);
};

export const uploadListingPhoto = async (
  dto: UploadListingPhotoDTO
): Promise<string> => {
  const uri = ensureNonEmpty(dto.uri, "Photo URI");
  return uploadListingPhotoService(uri);
};

export const createListing = async (dto: CreateListingDTO): Promise<Listing> => {
  const city = ensureNonEmpty(dto.city, "City");
  const address = ensureNonEmpty(dto.address, "Address");

  if (!dto.listing) {
    throw new Error("Listing payload is required.");
  }

  if (!dto.listing.userId) {
    throw new Error("User ID is required.");
  }

  if (!dto.listing.title?.trim()) {
    throw new Error("Listing title is required.");
  }

  if (!Number.isFinite(Number(dto.listing.price)) || Number(dto.listing.price) <= 0) {
    throw new Error("Price must be greater than 0.");
  }

  if (!dto.listing.rentPeriod) {
    throw new Error("Rent period is required.");
  }

  if (!dto.listing.propertyType) {
    throw new Error("Property type is required.");
  }

  const beds = Number(dto.listing.beds);
  const baths = Number(dto.listing.baths);
  if (!Number.isFinite(beds) || beds <= 0) {
    throw new Error("Beds must be greater than 0.");
  }
  if (!Number.isFinite(baths) || baths <= 0) {
    throw new Error("Baths must be greater than 0.");
  }

  return createListingService(dto.listing, city, address);
};
