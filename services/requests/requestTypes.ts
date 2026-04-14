export type RequestType = "SIGN_UP" | "CITY_CHANGE";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface RequestRecord {
    id: number;
    userId: string;
    requestType: RequestType;
    status: RequestStatus;
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
}

export interface CreateRequestDTO {
    userId: string;
    requestType: RequestType;
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
