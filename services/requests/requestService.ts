import { ActionType, ApprovalStatus, RequestStatus, RequestType } from "@/types/enums";
import { RequestRecord } from "@/types/records";
import { AdminRequest } from "@/types/views";
import { supabase } from "@lib/supabase";
import { AuditService } from "@services/audit/auditService";
import { ChatService } from "@services/chat/chatService";

function mapRequestRow(row: any): RequestRecord {
    return {
        id: row.id,
        userId: row.user_id,
        requestType: row.request_type as RequestType,
        status: row.status as RequestStatus,
        listingId: row.listing_id,
        oldCity: row.old_city,
        newCity: row.new_city,
        reviewedBy: row.reviewed_by,
        reviewedAt: row.reviewed_at,
        createdAt: row.created_at,
    };
}

import {
    CreateRequestDTO,
    ReviewRequestDTO,
} from "./types";




export const RequestService = {
    /**
     * Creates a pending request.
     */
    async createRequest(dto: CreateRequestDTO): Promise<RequestRecord> {
        const { data, error } = await supabase
            .from("requests")
            .insert({
                user_id: dto.userId,
                request_type: dto.requestType,
                status: RequestStatus.PENDING.toString(),
                listing_id: dto.listingId ?? null,
                old_city: dto.oldCity ?? null,
                new_city: dto.newCity ?? null,
            })
            .select()
            .single();

        if (error || !data) throw error || new Error("Failed to create request.");
        return mapRequestRow(data);
    },

    /**
     * Fetches all requests (admin).
     */
    async getAllRequests(statusFilter?: RequestStatus): Promise<AdminRequest[]> {
        let query = supabase.from('requests').select("*").order("created_at", { ascending: false });
        if (statusFilter) query = query.eq("status", statusFilter);

        const { data, error } = await query;
        if (error) throw error;

        const requests = (data ?? []).map(mapRequestRow) as AdminRequest[];

        const uniqueUserIds = [...new Set(requests.flatMap(r => [r.userId, r.reviewedBy]).filter((id): id is string => !!id))];
        if (uniqueUserIds.length > 0) {
            const { data: users } = await supabase.from("users").select("user_id, email, first_name, last_name").in("user_id", uniqueUserIds);
            if (users) {
                const userMap = Object.fromEntries(users.map(u => [u.user_id, u]));
                requests.forEach(r => {
                    const requester = userMap[r.userId];
                    if (requester) {
                        r.userEmail = requester.email;
                        r.userFirstName = requester.first_name;
                        r.userLastName = requester.last_name;
                    }
                    if (r.reviewedBy) r.reviewerEmail = userMap[r.reviewedBy]?.email;
                });
            }
        }

        const listingIds = [...new Set(requests.filter(r => r.requestType === RequestType.LISTING_UPLOAD && r.listingId).map(r => String(r.listingId)))];
        if (listingIds.length > 0) {
            const { data: listings } = await supabase.from("listings").select("id, title, price, rent_period, bedrooms, bathrooms, source, media_urls, listing_locations(city, address)").in("id", listingIds);
            if (listings) {
                const listingMap = new Map(listings.map(l => [String(l.id), l]));
                requests.forEach(r => {
                    if (r.requestType !== RequestType.LISTING_UPLOAD || !r.listingId) return;
                    const l = listingMap.get(String(r.listingId));
                    if (!l) return;
                    const loc = Array.isArray(l.listing_locations) ? l.listing_locations[0] : l.listing_locations;
                    r.listingTitle = l.title;
                    r.listingPrice = l.price;
                    r.listingRentPeriod = l.rent_period as any;
                    r.listingPropertyType = (l as any).property_type;
                    r.listingBeds = l.bedrooms;
                    r.listingBaths = l.bathrooms;
                    r.listingSource = l.source as any;
                    r.listingPhotos = l.media_urls || [];
                    r.listingCity = loc?.city;
                    r.listingAddress = loc?.address;
                });
            }
        }
        return requests;
    },

    /**
     * Fetches requests for a specific user.
     */
    async getUserRequests(userId: string): Promise<RequestRecord[]> {
        const { data, error } = await supabase.from('requests').select("*").eq("user_id", userId).order("created_at", { ascending: false });
        if (error) throw error;
        return (data ?? []).map(mapRequestRow);
    },

    /**
     * Handles city change request review logic.
     */
    async handleCityChangeReview(request: RequestRecord, decision: RequestStatus) {
        if (decision === RequestStatus.APPROVED && request.newCity) {
            const { error } = await supabase
                .from("users")
                .update({ office_location: request.newCity })
                .eq("user_id", request.userId);
            if (error) throw error;
        }
    },

    /**
     * Handles sign up request review logic.
     */
    async handleSignUpReview(request: RequestRecord, decision: RequestStatus) {
        const status = decision === RequestStatus.APPROVED ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
        const { error } = await supabase
            .from("users")
            .update({ approval_status: status })
            .eq("user_id", request.userId);
        if (error) throw error;

        // Assign the newly approved user to their city's group chat
        if (decision === RequestStatus.APPROVED) {
            const { data: userRow } = await supabase
                .from("users")
                .select("office_location")
                .eq("user_id", request.userId)
                .single();

            if (userRow?.office_location) {
                await ChatService.assignToCityGroupChat(request.userId, userRow.office_location);
            }
        }
    },

    /**
     * Handles listing upload request review logic.
     */
    async handleListingUploadReview(request: RequestRecord, decision: RequestStatus) {
        if (!request.listingId) return;
        const status = decision === RequestStatus.APPROVED ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
        const { error } = await supabase
            .from("listings")
            .update({ status })
            .eq("id", String(request.listingId));
        if (error) throw error;
    },

    /**
     * Reviews a request.
     */
    async reviewRequest(dto: ReviewRequestDTO): Promise<RequestRecord> {
        const { data: sessionData } = await supabase.auth.getSession();
        const reviewerId = sessionData?.session?.user?.id;
        if (!reviewerId) throw new Error("No authenticated user for review.");

        const { data: row, error: fetchError } = await supabase.from('requests').select("*").eq("id", dto.requestId).single();
        if (fetchError || !row) throw fetchError || new Error("Request not found.");
        if (row.status !== RequestStatus.PENDING) throw new Error("Already reviewed.");

        const request = mapRequestRow(row);

        // Process request type specific logic
        switch (request.requestType) {
            case RequestType.CITY_CHANGE:
                await this.handleCityChangeReview(request, dto.decision);
                break;
            case RequestType.SIGN_UP:
                await this.handleSignUpReview(request, dto.decision);
                break;
            case RequestType.LISTING_UPLOAD:
                await this.handleListingUploadReview(request, dto.decision);
                break;
        }

        // Update the request status and reviewer details
        const { data: updated, error: updateError } = await supabase
            .from('requests')
            .update({
                status: dto.decision,
                reviewed_by: reviewerId,
                reviewed_at: new Date().toISOString()
            })
            .eq("id", dto.requestId)
            .select()
            .single();

        if (updateError || !updated) throw updateError || new Error("Update failed.");

        const actionType = request.requestType === RequestType.CITY_CHANGE
            ? (dto.decision === RequestStatus.APPROVED ? ActionType.CITY_CHANGE_APPROVED : ActionType.CITY_CHANGE_REJECTED)
            : (dto.decision === RequestStatus.APPROVED ? ActionType.SIGN_UP_APPROVED : ActionType.SIGN_UP_REJECTED);

        await AuditService.logAction({
            actionType,
            targetId: request.userId,
            userId: reviewerId,
        });

        return mapRequestRow(updated);
    },

    /**
     * Checks for pending requests.
     */
    async hasPendingRequest(userId: string, requestType: RequestType, listingId?: number): Promise<boolean> {
        let query = supabase.from('requests').select("id").eq("user_id", userId).eq("request_type", requestType).eq("status", RequestStatus.PENDING);
        if (listingId) query = query.eq("listing_id", listingId);
        const { data, error } = await query.limit(1);
        if (error) throw error;
        return (data ?? []).length > 0;
    },
};

