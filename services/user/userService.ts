import { ActionType, ApprovalStatus, RequestType, Role } from "@/types/enums";
import { UserRecord } from "@/types/records";
import { supabase } from "@lib/supabase";
import { AuditService } from "@services/audit/auditService";
import { LocationService } from "@services/locations/locationService";
import {
    ProfilePictureUploadDTO,
    ResolvedProfilePictureSource
} from "@services/user/types";
import { File } from "expo-file-system";
import { getInitials } from "@utils/formatters";

type CachedProfilePictureUrl = {
    url: string;
    expiresAtMs: number;
};

const profilePictureUrlCache = new Map<string, CachedProfilePictureUrl>();
const PROFILE_PICTURE_BUCKET = "profile-pictures";

export const UserService = {

    /**
     * Fetches all users with PENDING status.
     */
    async getPendingUsers(): Promise<UserRecord[]> {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("approval_status", "PENDING")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return Promise.all((data || []).map(async (user: any) => ({
            userId: user.user_id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            officeLocation: await LocationService.resolveOfficeCityName(user.office_location),
            phoneNumber: user.phone_number,
            avatarUrl: user.avatar_url ?? null,
            role: user.role as Role,
            approvalStatus: user.approval_status as ApprovalStatus,
            createdAt: user.created_at,
        })));
    },

    // Helper function to fetch the user details
    async getUser(userId: string) {
        const { data: profile, error } = await supabase
            .from("users")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (error || !profile) throw new Error("Error getting user record.");
        return profile;
    },

    // Parses a user's name into it's capitalised initials
    async getUserInitials(user: UserRecord) {
        return getInitials(user.firstName, user.lastName);
    },

    // Gets a default profile picture URL via ui-avatars by passing in user initials
    async getFallbackProfilePictureUrl(user: UserRecord) {
        const fallbackName = await this.getUserInitials(user);
        const avatarSize = Math.max(128, 64 * 2);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&size=${avatarSize}&background=ccff00&color=1b1b1b&bold=true&format=png`;
    },

    // Returns user profile picture URL, falling back to an initials avatar if none is set
    async getUserProfilePicture(user: UserRecord): Promise<string | null> {
        // No stored picture — return the fallback initials avatar
        if (!user.avatarUrl) {
            return this.getFallbackProfilePictureUrl(user);
        }

        // If its a full URL, return it directly
        if (user.avatarUrl.startsWith("http")) return user.avatarUrl;

        // Check cache
        const cached = await this.getCachedProfilePictureUrl(user.avatarUrl);
        if (cached) return cached;

        // Get from Supabase storage
        const { data } = supabase.storage.from(PROFILE_PICTURE_BUCKET).getPublicUrl(user.avatarUrl);
        const url = data?.publicUrl ?? null;

        if (url) {
            // Cache for 1 hour
            await this.setCachedProfilePictureUrl(user.avatarUrl, url, 3600);
        }

        return url;
    },

    async getCachedProfilePictureUrl(path: string): Promise<string | null> {
        const cached = profilePictureUrlCache.get(path);
        if (!cached) return null;
        if (Date.now() >= cached.expiresAtMs) {
            profilePictureUrlCache.delete(path);
            return null;
        }
        return cached.url;
    },

    async setCachedProfilePictureUrl(path: string, url: string, expiresInSeconds: number): Promise<void> {
        profilePictureUrlCache.set(path, {
            url,
            expiresAtMs: Date.now() + expiresInSeconds * 1000,
        });
    },

    async resolveProfilePictureSource(avatarUrl?: string | null): Promise<ResolvedProfilePictureSource> {
        const value = avatarUrl?.trim();
        if (!value) return { path: null, directUrl: null };

        if (!/^https?:\/\//i.test(value)) {
            let normalizedPath = decodeURIComponent(value).replace(/^\/+/, "");
            normalizedPath = normalizedPath.replace(new RegExp(`^${PROFILE_PICTURE_BUCKET}\/`, "i"), "");
            return { path: normalizedPath || null, directUrl: null };
        }

        const publicMarker = `/storage/v1/object/public/${PROFILE_PICTURE_BUCKET}/`;
        const signedMarker = `/storage/v1/object/sign/${PROFILE_PICTURE_BUCKET}/`;
        const marker = value.includes(publicMarker) ? publicMarker : value.includes(signedMarker) ? signedMarker : null;

        if (!marker) return { path: null, directUrl: value };

        const encodedPath = value.split(marker)[1]?.split("?")[0] ?? "";
        return { path: decodeURIComponent(encodedPath).replace(/^\/+/, "") || null, directUrl: null };
    },

    async getUserRecord(userId: string): Promise<UserRecord> {
        const user = await this.getUser(userId);

        return {
            userId: user.user_id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            officeLocation: await LocationService.resolveOfficeCityName(user.office_location),
            phoneNumber: user.phone_number,
            avatarUrl: user.avatar_url ?? null,
            role: user.role as Role,
            approvalStatus: user.approval_status as ApprovalStatus,
            createdAt: user.created_at,
        };
    },

    // Gets a user profile by a given ID
    async getUserProfile(userId: string): Promise<UserRecord> {
        return this.getUserRecord(userId);
    },

    async uploadProfilePicture(authUserId: string, upload: ProfilePictureUploadDTO): Promise<string> {
        const uri = upload.imageUri;
        const explicitMimeType = upload.mimeType?.toLowerCase() ?? "";
        const extension = upload.fileName?.split(".").pop()?.toLowerCase() || uri.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
        const safeExtension = /^[a-z0-9]+$/.test(extension) ? extension : "jpg";
        const filePath = `${authUserId}/${Date.now()}.${safeExtension}`;

        const imageFile = new File(uri);
        const arrayBuffer = await imageFile.arrayBuffer();
        const contentType = explicitMimeType || `image/${safeExtension}`;

        const { data: existingProfile, error: existingProfileError } = await supabase
            .from("users")
            .select("avatar_url")
            .eq("user_id", authUserId)
            .single();

        if (existingProfile?.avatar_url && !existingProfile.avatar_url.startsWith("http")) {
            await supabase.storage.from(PROFILE_PICTURE_BUCKET).remove([existingProfile.avatar_url]);
        }

        const { error: uploadError } = await supabase.storage
            .from(PROFILE_PICTURE_BUCKET)
            .upload(filePath, arrayBuffer, { contentType, upsert: true });

        if (uploadError) throw uploadError;

        const { error: updateError } = await supabase
            .from("users")
            .update({ avatar_url: filePath })
            .eq("user_id", authUserId);

        if (updateError) throw updateError;

        profilePictureUrlCache.delete(authUserId);
        return filePath;
    },

    async deleteProfilePicture(authUserId: string): Promise<void> {
        const { data: user, error: fetchError } = await supabase
            .from("users")
            .select("avatar_url")
            .eq("user_id", authUserId)
            .single();

        if (fetchError || !user?.avatar_url) return;

        if (!user.avatar_url.startsWith("http")) {
            await supabase.storage.from(PROFILE_PICTURE_BUCKET).remove([user.avatar_url]);
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({ avatar_url: null })
            .eq("user_id", authUserId);

        if (updateError) throw updateError;

        profilePictureUrlCache.delete(authUserId);
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

    async requestOfficeLocationChange(authUserId: string, officeLocation: string, oldCity: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { data: existingPending } = await supabase
                .from("requests")
                .select("id")
                .eq("user_id", authUserId)
                .eq("request_type", "CITY_CHANGE")
                .eq("status", "PENDING")
                .limit(1);

            if (existingPending && existingPending.length > 0) {
                return { success: false, error: "You already have a pending relocation request." };
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

            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
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
        return (data || []).map((fav) => fav.listing_id);
    },
};
