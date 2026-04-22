import * as RequestService from "./requestService";
import {
    CreateRequestDTO,
    RequestRecord,
    RequestResponse,
    RequestStatus,
    RequestType,
    ReviewRequestDTO,
} from "./types";

const REQUEST_TYPES: RequestType[] = ["SIGN_UP", "CITY_CHANGE", "LISTING_UPLOAD"];
const REQUEST_STATUSES: RequestStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const REVIEW_DECISIONS: ReviewRequestDTO["decision"][] = ["APPROVED", "REJECTED"];

function requireNonEmpty(value: string | undefined | null, fieldName: string): string | null {
    const normalized = value?.trim() ?? "";
    if (!normalized) {
        return `${fieldName} is required.`;
    }

    return null;
}

function ensurePositiveNumber(value: unknown, fieldName: string): string | null {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return `${fieldName} must be a positive number.`;
    }

    return null;
}

/**
 * createRequest
 * Validates and creates a request record for the current user.
 *
 * @param dto The request creation payload.
 * @returns A request response containing the created record.
 */
export const createRequest = async (
    dto: CreateRequestDTO
): Promise<RequestResponse<RequestRecord>> => {
    if (!dto) {
        return { success: false, error: "Request payload is required." };
    }

    const userIdError = requireNonEmpty(dto.userId, "User ID");
    if (userIdError) {
        return { success: false, error: userIdError };
    }

    if (!REQUEST_TYPES.includes(dto.requestType)) {
        return { success: false, error: "Request type is invalid." };
    }

    if (dto.requestType === "LISTING_UPLOAD") {
        const listingIdError = ensurePositiveNumber(dto.listingId, "Listing ID");
        if (listingIdError) {
            return { success: false, error: listingIdError };
        }
    }

    if (dto.requestType === "CITY_CHANGE") {
        const newCityError = requireNonEmpty(dto.newCity, "New city");
        if (newCityError) {
            return { success: false, error: newCityError };
        }
    }

    return RequestService.createRequest({
        ...dto,
        userId: dto.userId.trim(),
        oldCity: dto.oldCity?.trim() ?? dto.oldCity,
        newCity: dto.newCity?.trim() ?? dto.newCity,
    });
};

/**
 * getAllRequests
 * Loads requests, optionally filtered by status.
 *
 * @param statusFilter Optional status filter to apply.
 * @returns A request response containing the request list.
 */
export const getAllRequests = async (
    statusFilter?: RequestStatus
): Promise<RequestResponse<RequestRecord[]>> => {
    if (statusFilter && !REQUEST_STATUSES.includes(statusFilter)) {
        return { success: false, error: "Status filter is invalid." };
    }

    return RequestService.getAllRequests(statusFilter);
};

/**
 * getUserRequests
 * Loads all requests belonging to a specific user.
 *
 * @param userId The user ID to load requests for.
 * @returns A request response containing the user request list.
 */
export const getUserRequests = async (
    userId: string
): Promise<RequestResponse<RequestRecord[]>> => {
    const userIdError = requireNonEmpty(userId, "User ID");
    if (userIdError) {
        return { success: false, error: userIdError };
    }

    return RequestService.getUserRequests(userId.trim());
};

/**
 * reviewRequest
 * Approves or rejects a request after validating the decision payload.
 *
 * @param dto The review payload.
 * @returns A request response containing the reviewed request.
 */
export const reviewRequest = async (
    dto: ReviewRequestDTO
): Promise<RequestResponse<RequestRecord>> => {
    if (!dto) {
        return { success: false, error: "Review payload is required." };
    }

    const requestIdError = ensurePositiveNumber(dto.requestId, "Request ID");
    if (requestIdError) {
        return { success: false, error: requestIdError };
    }

    if (!REVIEW_DECISIONS.includes(dto.decision)) {
        return { success: false, error: "Decision is invalid." };
    }

    return RequestService.reviewRequest({
        requestId: Number(dto.requestId),
        decision: dto.decision,
    });
};

/**
 * hasPendingRequest
 * Checks whether a pending request already exists for the given criteria.
 *
 * @param userId The user ID to check.
 * @param requestType The request type to match.
 * @param listingId Optional listing ID for listing-upload requests.
 * @returns A request response containing a boolean result.
 */
export const hasPendingRequest = async (
    userId: string,
    requestType: RequestType,
    listingId?: number
): Promise<RequestResponse<boolean>> => {
    const userIdError = requireNonEmpty(userId, "User ID");
    if (userIdError) {
        return { success: false, error: userIdError };
    }

    if (!REQUEST_TYPES.includes(requestType)) {
        return { success: false, error: "Request type is invalid." };
    }

    if (requestType === "LISTING_UPLOAD") {
        const listingIdError = ensurePositiveNumber(listingId, "Listing ID");
        if (listingIdError) {
            return { success: false, error: listingIdError };
        }
    }

    return RequestService.hasPendingRequest(userId.trim(), requestType, listingId);
};