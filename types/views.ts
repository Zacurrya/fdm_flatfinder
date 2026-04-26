import { PropertyType, RentPeriod } from "./enums";
import { AuditLogRecord, RequestRecord } from "./records";

/**
 * Types that represent combined records from multiple tables.
 */

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

// -- Requests --
