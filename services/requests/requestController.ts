import {
    CreateRequestDTO,
    RequestRecord,
    RequestResponse,
    RequestStatus,
    ReviewRequestDTO,
} from "./requestTypes";
import * as RequestService from "./requestService";

// Create a new request (sign-up or city change).
export const createRequest = async (
    dto: CreateRequestDTO
): Promise<RequestResponse<RequestRecord>> => {
    if (!dto.userId) {
        return { success: false, error: "User ID is required." };
    }

    if (!dto.requestType) {
        return { success: false, error: "Request type is required." };
    }

    if (dto.requestType === "CITY_CHANGE") {
        if (!dto.newCity?.trim()) {
            return { success: false, error: "New city is required for a city change request." };
        }
    }

    // Check for existing pending request of same type
    const pendingCheck = await RequestService.hasPendingRequest(dto.userId, dto.requestType);
    if (pendingCheck.success && pendingCheck.data) {
        return {
            success: false,
            error: dto.requestType === "CITY_CHANGE"
                ? "You already have a pending city change request."
                : "You already have a pending sign-up request.",
        };
    }

    return RequestService.createRequest(dto);
};

// Fetch all requests for admin view.
export const getAllRequests = async (
    statusFilter?: RequestStatus
): Promise<RequestResponse<RequestRecord[]>> => {
    return RequestService.getAllRequests(statusFilter);
};

// Fetch requests for a specific user.
export const getUserRequests = async (
    userId: string
): Promise<RequestResponse<RequestRecord[]>> => {
    if (!userId) {
        return { success: false, error: "User ID is required." };
    }

    return RequestService.getUserRequests(userId);
};

// Review (approve/reject) a request.
export const reviewRequest = async (
    dto: ReviewRequestDTO
): Promise<RequestResponse<RequestRecord>> => {
    if (!dto.requestId) {
        return { success: false, error: "Request ID is required." };
    }

    if (!dto.decision || !["APPROVED", "REJECTED"].includes(dto.decision)) {
        return { success: false, error: "Decision must be APPROVED or REJECTED." };
    }

    return RequestService.reviewRequest(dto);
};
