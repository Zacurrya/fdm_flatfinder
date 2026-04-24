import { Listing } from "@/types/views";

export type ListingFilterInput = {
    searchQuery: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: number | null;
    bathrooms: number | null;
    sourceFilter: string | null;
};

// Converts listing price to monthly
function toMonthlyPrice(listing: Listing): number {
    if (listing.rentPeriod === "WEEKLY") { return (listing.price * 52) / 12; }
    else if (listing.rentPeriod === "BIWEEKLY") { return (listing.price * 26) / 12; }
    else { return listing.price; }
}

// Reads the filters and returns a filtered listing array
export const filterListings = (listings: Listing[], filters: ListingFilterInput): Listing[] => {
    const {
        searchQuery,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        sourceFilter,
    } = filters;

    return listings.filter((listing) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const address = listing.address || "";
            if (
                !listing.title.toLowerCase().includes(query) &&
                !address.toLowerCase().includes(query)
            ) {
                return false;
            }
        }

        const monthlyPrice = toMonthlyPrice(listing);
        if (minPrice && monthlyPrice < parseInt(minPrice, 10)) { return false; }
        if (maxPrice && monthlyPrice > parseInt(maxPrice, 10)) { return false; }
        if (bedrooms && listing.bedrooms && listing.bedrooms < bedrooms) { return false; }
        if (bathrooms && listing.bathrooms && listing.bathrooms < bathrooms) { return false; }
        if (sourceFilter && listing.source !== sourceFilter) { return false; }

        return true;
    });
}
