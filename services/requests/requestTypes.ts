export type RequestType = "SIGN_UP" | "CITY_CHANGE" | "LISTING_UPLOAD";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface RequestRecord {
    id: number;
    userId: string;
    requestType: RequestType;
    status: RequestStatus;
    listingId: number | null;
    oldCity: string | null;
    newCity: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    createdAt: string;
    // Populated at read-time (not stored)
    userEmail?: string;
    userFirstName?: string;
    userLastName?: string;
    reviewerEmail?: string;

    // Listing request context (populated at read-time)
    listingTitle?: string;
    listingPrice?: number;
    listingRentPeriod?: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
    listingPropertyType?: "FLAT" | "STUDIO" | "TERRACEDHOUSE" | "SEMIDETACHED" | "DETACHED";
    listingBeds?: number | null;
    listingBaths?: number | null;
    listingSource?: "FDM" | "RIGHTMOVE" | "OPENRENT" | "ZOOPLA";
    listingPhotos?: string[];
    listingCity?: string | null;
    listingAddress?: string | null;
}

export interface CreateRequestDTO {
    userId: string;
    requestType: RequestType;
    listingId?: number | null;
    oldCity?: string | null;
    newCity?: string | null;
}

export interface ReviewRequestDTO {
    requestId: number;
    decision: "APPROVED" | "REJECTED";
}

export interface RequestResponse<T = undefined> {
    success: boolean;
    data?: T;
    error?: string;
}
