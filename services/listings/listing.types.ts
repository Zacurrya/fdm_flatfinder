export type CreateListingDTO = {
    listing: InsertListing;
    city: string;
    address: string;
};

export type ListingIdDTO = {
    id: number | string;
};

export type UploadListingPhotoDTO = {
    uri: string;
};

function ensureValidListingId(id: number | string): number {
    const listingId = Number(id);
    if (!Number.isFinite(listingId) || listingId <= 0) {
        throw new Error("Listing ID must be a positive number.");
    }

    return listingId;
}
