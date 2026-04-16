import { supabase } from "@lib/supabase";
import {
    CreateRequestDTO,
    RequestRecord,
    RequestResponse,
    RequestStatus,
    RequestType,
    ReviewRequestDTO,
} from "./requestTypes";

const REQUESTS_TABLE = "Requests";

function mapRequestRow(row: Record<string, any>): RequestRecord {
    return {
        id: row.id,
        userId: row.userId ?? "",
        requestType: row.requestType ?? row.request_type,
        status: row.status as RequestStatus,
        listingId: row.listingId ?? row.listing_id ?? null,
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
            listingId: dto.listingId ?? null,
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

    // Enrich listing data for listing upload requests
    const listingRequestIds = [
        ...new Set(
            requests
                .filter((r) => r.requestType === "LISTING_UPLOAD" && r.listingId !== null)
                .map((r) => Number(r.listingId))
        ),
    ];

    if (listingRequestIds.length > 0) {
        const { data: listingRows } = await supabase
            .from("Listings")
            .select("id, title, price, rentPeriod, propertyType, beds, baths, source, photos, ListingLocations(city, address)")
            .in("id", listingRequestIds);

        if (listingRows) {
            const listingMap = new Map<number, Record<string, any>>(
                listingRows.map((row) => [Number(row.id), row as Record<string, any>])
            );

            for (const request of requests) {
                if (request.requestType !== "LISTING_UPLOAD" || request.listingId === null) {
                    continue;
                }

                const listing = listingMap.get(Number(request.listingId));
                if (!listing) {
                    continue;
                }

                const rawLocations = listing.ListingLocations;
                const listingLocation = Array.isArray(rawLocations)
                    ? rawLocations[0]
                    : rawLocations;

                request.listingTitle = listing.title ?? undefined;
                request.listingPrice = listing.price ?? undefined;
                request.listingRentPeriod = listing.rentPeriod ?? undefined;
                request.listingPropertyType = listing.propertyType ?? undefined;
                request.listingBeds = listing.beds ?? null;
                request.listingBaths = listing.baths ?? null;
                request.listingSource = listing.source ?? undefined;
                request.listingPhotos = Array.isArray(listing.photos) ? listing.photos : [];
                request.listingCity = listingLocation?.city ?? null;
                request.listingAddress = listingLocation?.address ?? null;
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

    // 2. Apply decision side-effects before marking request as reviewed.
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
            return { success: false, error: userUpdateError.message };
        }
    }

    // Sign-up decisions update user account approval.
    if (request.requestType === "SIGN_UP") {
        const approvalStatus = dto.decision === "APPROVED" ? "APPROVED" : "REJECTED";
        const { error: userUpdateError } = await supabase
            .from("Users")
            .update({ approvalStatus })
            .eq("userId", request.userId);

        if (userUpdateError) {
            return { success: false, error: userUpdateError.message };
        }
    }

    // Listing upload decisions determine public visibility.
    if (request.requestType === "LISTING_UPLOAD") {
        if (!request.listingId) {
            return { success: false, error: "Listing request is missing listingId." };
        }

        const listingApprovalStatus = dto.decision === "APPROVED" ? "APPROVED" : "REJECTED";
        const { error: listingUpdateError } = await supabase
            .from("Listings")
            .update({ approvalStatus: listingApprovalStatus })
            .eq("id", Number(request.listingId));

        if (listingUpdateError) {
            return { success: false, error: listingUpdateError.message };
        }
    }

    // 3. Mark request as reviewed.
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

    // 4. Create audit log entry
    const actionType =
        request.requestType === "CITY_CHANGE"
            ? dto.decision === "APPROVED"
                ? "CITY_CHANGE_APPROVED"
                : "CITY_CHANGE_DENIED"
            : request.requestType === "LISTING_UPLOAD"
                ? dto.decision === "APPROVED"
                    ? "LISTING_UPLOAD_APPROVED"
                    : "LISTING_UPLOAD_DENIED"
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
    requestType: RequestType,
    listingId?: number
): Promise<RequestResponse<boolean>> => {
    let query = supabase
        .from(REQUESTS_TABLE)
        .select("id")
        .eq("userId", userId)
        .eq("requestType", requestType)
        .eq("status", "PENDING");

    if (requestType === "LISTING_UPLOAD" && typeof listingId === "number") {
        query = query.eq("listingId", listingId);
    }

    const { data, error } = await query.limit(1);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []).length > 0 };
};
