import { ListingRecord } from "@/types/records";
import { FilterListingsDTO } from "@services/listings/types";

// Converts listing price to monthly
function toMonthlyPrice(listing: ListingRecord): number {
    if (listing.rentPeriod === "WEEKLY") { return (listing.price * 52) / 12; }
    else if (listing.rentPeriod === "BIWEEKLY") { return (listing.price * 26) / 12; }
    else { return listing.price; }
}

// Reads the filters and returns a filtered listing array
export const filterListings = (listings: ListingRecord[], filters: FilterListingsDTO & { savedListingIds?: string[] }): ListingRecord[] => {
    const {
        searchQuery,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        sourceFilter,
        onlySaved,
        savedListingIds = [],
    } = filters;

    return listings.filter((listing) => {
        if (onlySaved && !savedListingIds.includes(listing.id)) {
            return false;
        }

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
        if (minPrice && monthlyPrice < parseInt(String(minPrice), 10)) { return false; }
        if (maxPrice && monthlyPrice > parseInt(String(maxPrice), 10)) { return false; }
        if (typeof bedrooms === 'number') {
            if (typeof listing.bedrooms !== 'number' || listing.bedrooms !== bedrooms) {
                return false;
            }
        }
        if (typeof bathrooms === 'number') {
            if (typeof listing.bathrooms !== 'number' || listing.bathrooms !== bathrooms) {
                return false;
            }
        }
        if (sourceFilter && listing.source !== sourceFilter) { return false; }

        return true;
    });
}
