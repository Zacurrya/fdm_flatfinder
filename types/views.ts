import { PropertyType, RentPeriod } from "./enums";
import { AuditLogRecord, ListingRecord, RequestRecord } from "./records";

/**
 * Types that represent combined records from multiple tables.
 */

export type Listing = ListingRecord & {
    city: string;
    address: string;
};

// Enriched for the admin request page
export type AdminRequest = RequestRecord & {
    userEmail?: string;
    userFirstName?: string;
    userLastName?: string;
    reviewerEmail?: string;
    listingTitle?: string;
    listingPrice?: number;
    listingRentPeriod?: RentPeriod;
    listingPropertyType?: PropertyType;
    listingBeds?: number;
    listingBaths?: number;
    listingSource?: string;
    listingPhotos?: string[];
    listingCity?: string;
    listingAddress?: string;
    // Shorter aliases for component compatibility
    price?: number;
    rentPeriod?: RentPeriod;
    propertyType?: PropertyType;
};

// Enriched for the audit log table
export type AuditLogEntry = AuditLogRecord & {
    userEmail?: string;
    userFirstName?: string;
    userLastName?: string;
    targetEmail?: string;
    targetFirstName?: string;
    targetLastName?: string;
}

// User profile for display purposes
export type UserProfile = {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    email: string;
    phoneNumber: string;
};
