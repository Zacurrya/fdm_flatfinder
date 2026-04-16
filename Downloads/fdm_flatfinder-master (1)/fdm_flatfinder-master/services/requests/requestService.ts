import { supabase } from "@lib/supabase";
import {
    CreateRequestDTO,
    RequestRecord,
    RequestResponse,
    RequestStatus,
    ReviewRequestDTO,
} from "./requestTypes";

const REQUESTS_TABLE = "Requests";

function mapRequestRow(row: Record<string, any>): RequestRecord {
    return {
        id: row.id,
        userId: row.userId ?? "",
        requestType: row.requestType ?? row.request_type,
        status: row.status as RequestStatus,
        oldCity: row.oldCity ?? row.old_city ?? null,
        newCity: row.newCity ?? row.new_city ?? null,
        reviewedBy: row.reviewedBy ?? row.reviewed_by ?? null,
        reviewedAt: row.reviewedAt ?? row.reviewed_at ?? null,
        createdAt: row.created_at ?? new Date().toISOString(),
    };
}

// Creates a new request record.
export const createRequest = async (
    dto: CreateRequestDTO
): Promise<RequestResponse<RequestRecord>> => {
    const { data, error } = await supabase
        .from(REQUESTS_TABLE)
        .insert({
            userId: dto.userId,
            requestType: dto.requestType,
            status: "PENDING" as const,
            oldCity: dto.oldCity ?? null,
            newCity: dto.newCity ?? null,
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: mapRequestRow(data as Record<string, any>),
    };
};

// Fetches all requests (admin). Optionally filter by status.
export const getAllRequests = async (
    statusFilter?: RequestStatus
): Promise<RequestResponse<RequestRecord[]>> => {
    let query = supabase
        .from(REQUESTS_TABLE)
        .select("*")
        .order("created_at", { ascending: false });

    if (statusFilter) {
        query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
        return { success: false, error: error.message };
    }

    const requests = (data ?? []).map((row) =>
        mapRequestRow(row as Record<string, any>)
    );

    // Enrich with user emails and names
    const uniqueUserIds = [
        ...new Set(
            requests
                .flatMap((r) => [r.userId, r.reviewedBy])
                .filter((id): id is string => Boolean(id))
        ),
    ];

    if (uniqueUserIds.length > 0) {
        const { data: users } = await supabase
            .from("Users")
            .select("userId, email, firstName, lastName")
            .in("userId", uniqueUserIds);

        if (users) {
            const userMap = Object.fromEntries(
                users.map((u) => [
                    u.userId,
                    {
                        email: u.email ?? "",
                        firstName: u.firstName ?? "",
                        lastName: u.lastName ?? "",
                    },
                ])
            );

            for (const request of requests) {
                const requester = userMap[request.userId];
                if (requester) {
                    request.userEmail = requester.email;
                    request.userFirstName = requester.firstName;
                    request.userLastName = requester.lastName;
                }

                if (request.reviewedBy) {
                    const reviewer = userMap[request.reviewedBy];
                    if (reviewer) {
                        request.reviewerEmail = reviewer.email;
                    }
                }
            }
        }
    }

    return { success: true, data: requests };
};

// Fetches requests for a specific user.
export const getUserRequests = async (
    userId: string
): Promise<RequestResponse<RequestRecord[]>> => {
    const { data, error } = await supabase
        .from(REQUESTS_TABLE)
        .select("*")
        .eq("userId", userId)
        .order("created_at", { ascending: false });

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: (data ?? []).map((row) => mapRequestRow(row as Record<string, any>)),
    };
};

// Reviews (approves/rejects) a request. Updates the request row and,
// for city changes, applies the new office location if approved.
export const reviewRequest = async (
    dto: ReviewRequestDTO
): Promise<RequestResponse<RequestRecord>> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const reviewerId = sessionData?.session?.user?.id;

    if (!reviewerId) {
        return { success: false, error: "No authenticated user for review." };
    }

    // 1. Fetch the request
    const { data: request, error: fetchError } = await supabase
        .from(REQUESTS_TABLE)
        .select("*")
        .eq("id", dto.requestId)
        .single();

    if (fetchError || !request) {
        return { success: false, error: fetchError?.message ?? "Request not found." };
    }

    if (!request.userId) {
        return { success: false, error: "Request has no associated user." };
    }

    if (request.status !== "PENDING") {
        return { success: false, error: "This request has already been reviewed." };
    }

    // 2. Update the request status
    const { data: updatedRequest, error: updateError } = await supabase
        .from(REQUESTS_TABLE)
        .update({
            status: dto.decision,
            reviewedBy: reviewerId,
            reviewedAt: new Date().toISOString(),
        })
        .eq("id", dto.requestId)
        .select()
        .single();

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    // 3. If it's a city change approval, update the user's office location
    if (
        request.requestType === "CITY_CHANGE" &&
        dto.decision === "APPROVED" &&
        request.newCity
    ) {
        const { error: userUpdateError } = await supabase
            .from("Users")
            .update({ officeLocation: request.newCity })
            .eq("userId", request.userId);

        if (userUpdateError) {
            console.warn("Failed to update user office location:", userUpdateError.message);
        }
    }

    // 4. If it's a sign-up decision, update the user's approval status
    if (request.requestType === "SIGN_UP") {
        const approvalStatus = dto.decision === "APPROVED" ? "APPROVED" : "REJECTED";
        const { error: userUpdateError } = await supabase
            .from("Users")
            .update({ approvalStatus })
            .eq("userId", request.userId);

        if (userUpdateError) {
            console.warn("Failed to update user approval status:", userUpdateError.message);
        }
    }

    // 5. Create audit log entry
    const actionType =
        request.requestType === "CITY_CHANGE"
            ? dto.decision === "APPROVED"
                ? "CITY_CHANGE_APPROVED"
                : "CITY_CHANGE_DENIED"
            : dto.decision === "APPROVED"
                ? "SIGN_UP_APPROVED"
                : "SIGN_UP_DENIED";

    await supabase.from("AuditLogs").insert({
        actionType,
        userId: reviewerId,
        targetId: request.userId,
    });

    return {
        success: true,
        data: mapRequestRow(updatedRequest as Record<string, any>),
    };
};

// Checks if a user already has a pending request of a given type.
export const hasPendingRequest = async (
    userId: string,
    requestType: "SIGN_UP" | "CITY_CHANGE"
): Promise<RequestResponse<boolean>> => {
    const { data, error } = await supabase
        .from(REQUESTS_TABLE)
        .select("id")
        .eq("userId", userId)
        .eq("requestType", requestType)
        .eq("status", "PENDING")
        .limit(1);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []).length > 0 };
};
