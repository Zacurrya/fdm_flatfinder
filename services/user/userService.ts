import { ActionType, ApprovalStatus, RequestType, Role } from "@/types/enums";
import { UserRecord } from "@/types/records";
import { supabase } from "@lib/supabase";
import { AuditService } from "@services/audit/auditService";
import { StorageService } from "@services/storage/storageService";
import {
    ProfilePictureUploadDTO
} from "@services/user/types";
import { getInitials } from "@utils/formatters";
import { LocationService } from "@services/locations/locationService";

const PROFILE_PICTURE_BUCKET = "profile-pictures";

export const UserService = {
    /**
     * Query keys for React Query
     */
    queryKeys: {
        user: (userId: string) => ["user", userId] as const,
        pendingUsers: () => ["users", "pending"] as const,
    },

    /**
     * Fetches all users with PENDING status.
     */
    async getPendingUsers(): Promise<UserRecord[]> {
        const { data, error } = await supabase
            .from("users")
            .select("*, locations(name)")
            .eq("approval_status", "PENDING")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return (data || []).map((user: any) => ({
            userId: user.user_id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            officeLocation: user.locations?.name || "Unknown",
            officeLocationId: user.office_location,
            phoneNumber: user.phone_number,
            avatarUrl: user.avatar_url ?? null,
            role: user.role as Role,
            approvalStatus: user.approval_status as ApprovalStatus,
            createdAt: user.created_at,
        }));
    },

    // Parses a user's name into its capitalized initials
    getUserInitials(user: UserRecord) {
        return getInitials(user.firstName, user.lastName);
    },

    // Gets a default profile picture URL via ui-avatars by passing in user initials
    getFallbackProfilePictureUrl(user: UserRecord) {
        const initials = this.getUserInitials(user);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=256&background=ccff00&color=1b1b1b&bold=true&format=png`;
    },

    // Returns user profile picture URL, falling back to an initials avatar if none is set
    getUserProfilePicture(user: UserRecord): string {
        return user.avatarUrl || this.getFallbackProfilePictureUrl(user);
    },


    async getCurrentUser(): Promise<UserRecord> {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw authError || new Error("No authenticated user.");
        return this.getUserRecord(user.id);
    },


    async getUserRecord(userId: string): Promise<UserRecord> {
        const { data: user, error } = await supabase
            .from("users")
            .select("*, locations(name)")
            .eq("user_id", userId)
            .single();

        if (error || !user) throw new Error("Error getting user record.");

        return {
            userId: user.user_id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            officeLocation: user.locations?.name || "Unknown",
            officeLocationId: user.office_location,
            phoneNumber: user.phone_number,
            avatarUrl: user.avatar_url ?? null,
            role: user.role as Role,
            approvalStatus: user.approval_status as ApprovalStatus,
            createdAt: user.created_at,
        };
    },

    async uploadProfilePicture(authUserId: string, upload: ProfilePictureUploadDTO): Promise<string> {
        const uri = upload.imageUri;
        const explicitMimeType = upload.mimeType?.toLowerCase() ?? "";
        const extension = upload.fileName?.split(".").pop()?.toLowerCase() || uri.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
        const safeExtension = /^[a-z0-9]+$/.test(extension) ? extension : "jpg";

        // Case: Existing profile picture
        // Fetches from table, deletes in storage bucket, and uploads new file
        const { data: existingProfile } = await supabase
            .from("users")
            .select("avatar_url")
            .eq("user_id", authUserId)
            .single();
        if (existingProfile?.avatar_url) { await StorageService.deleteFile(PROFILE_PICTURE_BUCKET, existingProfile.avatar_url) }

        const filePath = await StorageService.uploadFile(PROFILE_PICTURE_BUCKET, uri, {
            pathPrefix: authUserId,
            upsert: true,
            contentType: explicitMimeType || `image/${safeExtension}`
        });

        // Always: Updates the user record with the new profile picture URL
        const { error: updateError } = await supabase
            .from("users")
            .update({ avatar_url: filePath })
            .eq("user_id", authUserId);

        if (updateError) throw updateError;
        return filePath;
    },

    async deleteProfilePicture(authUserId: string): Promise<void> {
        const { data: user, error: fetchError } = await supabase
            .from("users")
            .select("avatar_url")
            .eq("user_id", authUserId)
            .single();

        if (fetchError || !user?.avatar_url) return;

        if (user?.avatar_url) {
            // Deletes from storage bucket and nulls the user's avatar_url
            await StorageService.deleteFile(PROFILE_PICTURE_BUCKET, user.avatar_url)

            const { error: updateError } = await supabase
                .from("users")
                .update({ avatar_url: null })
                .eq("user_id", authUserId);
            if (updateError) throw updateError; // Possible: invalid URL 
        }
    },

    async updateProfile(authUserId: string, data: Partial<UserRecord>): Promise<void> {
        const { error: updateError } = await supabase
            .from("users")
            .update({
                first_name: data.firstName,
                last_name: data.lastName,
                phone_number: data.phoneNumber,
                office_location: data.officeLocation,
            })
            .eq("user_id", authUserId);

        if (updateError) throw updateError;
    },

    /**
     * Requests a change in office location for a user.
     */
    async requestOfficeLocationChange(authUserId: string, officeLocation: string, oldCity: string): Promise<void> {
        const { data: existingPending } = await supabase
            .from("requests")
            .select("id")
            .eq("user_id", authUserId)
            .eq("request_type", "CITY_CHANGE")
            .eq("status", "PENDING")
            .limit(1);

        if (existingPending && existingPending.length > 0) {
            throw new Error("You already have a pending relocation request.");
        }

        const { error: requestError } = await supabase.from("requests").insert({
            user_id: authUserId,
            request_type: RequestType.CITY_CHANGE,
            status: ApprovalStatus.PENDING,
            old_city: oldCity,
            new_city: officeLocation,
        });

        if (requestError) throw requestError;

        await AuditService.logAction({
            actionType: ActionType.CITY_CHANGE_REQUESTED,
            userId: authUserId,
            targetId: authUserId,
        });
    },

    /**
     * Adds a listing to a user's saved listings.
     */
    async addSavedListing(userId: string, listingId: string): Promise<void> {
        const { error } = await supabase.from("user_favourites").insert({ user_id: userId, listing_id: listingId });
        if (error) throw error;
    },

    /**
     * Removes a listing from a user's saved listings.
     */
    async removeSavedListing(userId: string, listingId: string): Promise<void> {
        const { error } = await supabase
            .from("user_favourites")
            .delete()
            .eq("user_id", userId)
            .eq("listing_id", listingId);
        if (error) throw error;
    },

    /**
     * @returns All listing IDs favorited by the user
     */
    async getSavedListingIds(userId: string): Promise<string[]> {
        const { data, error } = await supabase.from("user_favourites").select("listing_id").eq("user_id", userId);
        if (error) throw error;
        const ids = (data || []).map((fav) => fav.listing_id);
        return ids;
    },

    /**
     * Assigns a user to the city group chat for their office location.
     * Looks up the chat_id associated with the location and adds the user as a participant.
     */
    async addUserToCityChat(userId: string, locationId: string): Promise<string> {
        // 1. Look up the chat_id from the locations table
        const location = await LocationService.getLocationById(locationId);

        if (!location?.chatId) {
            throw new Error("No city chat assigned to this location.");
        }

        const chatId = location.chatId;

        // 2. Check if user is already a participant to avoid duplicates
        const { data: existing, error: checkError } = await supabase
            .from("chat_participants")
            .select("chat_id")
            .eq("chat_id", chatId)
            .eq("user_id", userId)
            .maybeSingle();

        if (checkError) {
            throw checkError;
        }

        if (!existing) {
            // 3. Add user as participant if they aren't already in the chat
            const { error: participantError } = await supabase
                .from("chat_participants")
                .insert({ chat_id: chatId, user_id: userId });

            if (participantError) {
                throw participantError;
            }
        }

        return chatId;
    },
};
