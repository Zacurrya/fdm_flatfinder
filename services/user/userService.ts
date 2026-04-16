import { supabase } from "@lib/supabase";
import {
    AuthResponse,
    ProfilePictureUploadDTO,
    User,
} from "@services/auth/auth.types";
import { File } from "expo-file-system";

const PROFILE_PICTURE_BUCKET = "profile-pictures";

type CachedProfilePictureUrl = {
    url: string;
    expiresAtMs: number;
};

const profilePictureUrlCache = new Map<string, CachedProfilePictureUrl>();

function getCachedProfilePictureUrl(path: string): string | null {
    const cached = profilePictureUrlCache.get(path);
    if (!cached) {
        return null;
    }

    if (Date.now() >= cached.expiresAtMs) {
        profilePictureUrlCache.delete(path);
        return null;
    }

    return cached.url;
}

function setCachedProfilePictureUrl(path: string, url: string, expiresInSeconds: number): void {
    profilePictureUrlCache.set(path, {
        url,
        expiresAtMs: Date.now() + expiresInSeconds * 1000,
    });
}

export type ResolvedProfilePictureSource = {
    path: string | null;
    directUrl: string | null;
};

export type ProfilePictureFallbackOptions = {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    size?: number;
};

export type GetProfilePictureUrlOptions = ProfilePictureFallbackOptions & {
    profilePicture?: string | null;
    expiresInSeconds?: number;
};

function getFallbackProfilePictureName(options: ProfilePictureFallbackOptions = {}): string {
    const fullName = `${options.firstName ?? ""} ${options.lastName ?? ""}`.trim();
    if (fullName) {
        return fullName;
    }

    const emailDisplayName = options.email?.split("@")[0]?.replace(/[._-]+/g, " ")?.trim();
    if (emailDisplayName) {
        return emailDisplayName;
    }

    return "User";
}

export function getFallbackProfilePictureInitials(options: ProfilePictureFallbackOptions = {}): string {
    const fallbackName = getFallbackProfilePictureName(options);
    const parts = fallbackName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    const initials = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");

    return initials || "U";
}

export function getFallbackProfilePictureUrl(options: ProfilePictureFallbackOptions = {}): string {
    const fallbackName = getFallbackProfilePictureName(options);
    const requestedSize = options.size ?? 64;
    const avatarSize = Math.max(128, requestedSize * 2);

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&size=${avatarSize}&background=ccff00&color=1b1b1b&bold=true&format=png`;
}

export function resolveProfilePictureSource(
    profilePicture?: string | null
): ResolvedProfilePictureSource {
    const value = profilePicture?.trim();
    if (!value) {
        return { path: null, directUrl: null };
    }

    if (!/^https?:\/\//i.test(value)) {
        let normalizedPath = decodeURIComponent(value).replace(/^\/+/, "");
        normalizedPath = normalizedPath.replace(new RegExp(`^${PROFILE_PICTURE_BUCKET}\/`, "i"), "");
        return {
            path: normalizedPath || null,
            directUrl: null,
        };
    }

    const publicMarker = `/storage/v1/object/public/${PROFILE_PICTURE_BUCKET}/`;
    const signedMarker = `/storage/v1/object/sign/${PROFILE_PICTURE_BUCKET}/`;
    const marker = value.includes(publicMarker)
        ? publicMarker
        : value.includes(signedMarker)
            ? signedMarker
            : null;

    if (!marker) {
        return { path: null, directUrl: value };
    }

    const encodedPath = value.split(marker)[1]?.split("?")[0] ?? "";
    return {
        path: decodeURIComponent(encodedPath).replace(/^\/+/, "") || null,
        directUrl: null,
    };
}

export const getProfilePictureUrl = async (
    options: GetProfilePictureUrlOptions = {}
): Promise<string> => {
    const {
        profilePicture,
        expiresInSeconds = 60 * 60,
        ...fallbackOptions
    } = options;

    const fallbackUrl = getFallbackProfilePictureUrl(fallbackOptions);
    const source = resolveProfilePictureSource(profilePicture);
    if (source.directUrl) {
        return source.directUrl;
    }

    if (!source.path) {
        return fallbackUrl;
    }

    const cachedUrl = getCachedProfilePictureUrl(source.path);
    if (cachedUrl) {
        return cachedUrl;
    }

    const { data, error } = await supabase.storage
        .from(PROFILE_PICTURE_BUCKET)
        .createSignedUrl(source.path, expiresInSeconds);

    if (error || !data?.signedUrl) {
        return fallbackUrl;
    }

    setCachedProfilePictureUrl(source.path, data.signedUrl, expiresInSeconds);

    return data.signedUrl;
}

// Fetches all users with approvalStatus = 'PENDING'.
// Used by the admin approval screen.
export const getPendingUsers = async (): Promise<
    AuthResponse<User[]>
> => {
    const { data, error } = await supabase
        .from("Users")
        .select("*")
        .eq("approvalStatus", "PENDING")
        .order("created_at", { ascending: true });

    if (error) {
        return { success: false, error: error.message };
    }

    const users = (data ?? []).map((row) => ({
        userId: row.userId,
        firstName: row.firstName ?? "",
        lastName: row.lastName ?? "",
        profilePicture: row.profilePicture ?? null,
        email: row.email ?? "",
        phoneNumber: row.phoneNumber ?? "",
        officeLocation: row.officeLocation ?? "",
        role: row.role as User["role"],
        approvalStatus: row.approvalStatus as User["approvalStatus"],
        createdAt: row.created_at,
    }));

    return { success: true, data: users };
};

// Uploads a local image URI to Supabase Storage and stores the public URL
// in the Users.profilePicture column for the current user.
export const uploadProfilePicture = async (
    authUserId: string,
    upload: ProfilePictureUploadDTO
): Promise<AuthResponse<string>> => {
    try {
        const uri = upload.imageUri;
        const explicitMimeType = upload.mimeType?.toLowerCase() ?? "";
        const explicitExtension = upload.fileName?.split(".").pop()?.toLowerCase() ?? "";
        const uriExtension = uri.split(".").pop()?.split("?")[0]?.toLowerCase() ?? "";
        const extension = explicitExtension || uriExtension || (explicitMimeType.split("/")[1] ?? "jpg");
        const safeExtension = /^[a-z0-9]+$/.test(extension) ? extension : "jpg";
        const filePath = `${authUserId}/${Date.now()}.${safeExtension}`;

        // Ensure we can read the new profile picture before mutating storage state.
        const imageFile = new File(uri);
        const arrayBuffer = await imageFile.arrayBuffer();
        const contentType = explicitMimeType || `image/${safeExtension}`;

        const { data: existingProfile, error: existingProfileError } = await supabase
            .from("Users")
            .select("profilePicture")
            .eq("userId", authUserId)
            .single();

        if (existingProfileError) {
            return { success: false, error: existingProfileError.message };
        }

        const oldPath = resolveProfilePictureSource(existingProfile?.profilePicture).path;
        if (oldPath) {
            const { error: removeOldImageError } = await supabase.storage
                .from(PROFILE_PICTURE_BUCKET)
                .remove([oldPath]);

            if (removeOldImageError && !/not found/i.test(removeOldImageError.message)) {
                return { success: false, error: removeOldImageError.message };
            }

            profilePictureUrlCache.delete(oldPath);
        }

        const { error: uploadError } = await supabase.storage
            .from(PROFILE_PICTURE_BUCKET)
            .upload(filePath, arrayBuffer, {
                upsert: true,
                cacheControl: "3600",
                contentType,
            });

        if (uploadError) {
            return { success: false, error: uploadError.message };
        }

        const { error: updateError } = await supabase
            .from("Users")
            .update({ profilePicture: filePath })
            .eq("userId", authUserId);

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        profilePictureUrlCache.delete(filePath);

        return { success: true, data: filePath };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown upload error.";

        return { success: false, error: message };
    }
};

export const removeProfilePicture = async (
    authUserId: string
): Promise<AuthResponse> => {
    try {
        const { data: existingProfile, error: existingProfileError } = await supabase
            .from("Users")
            .select("profilePicture")
            .eq("userId", authUserId)
            .single();

        if (existingProfileError) {
            return { success: false, error: existingProfileError.message };
        }

        const oldPath = resolveProfilePictureSource(existingProfile?.profilePicture).path;
        if (oldPath) {
            const { error: removeOldImageError } = await supabase.storage
                .from(PROFILE_PICTURE_BUCKET)
                .remove([oldPath]);

            if (removeOldImageError && !/not found/i.test(removeOldImageError.message)) {
                return { success: false, error: removeOldImageError.message };
            }

            profilePictureUrlCache.delete(oldPath);
        }

        const { error: updateError } = await supabase
            .from("Users")
            .update({ profilePicture: null })
            .eq("userId", authUserId);

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown remove profile picture error.";

        return { success: false, error: message };
    }
};

export const requestOfficeLocationChange = async (
    authUserId: string,
    officeLocation: string
): Promise<AuthResponse> => {
    // Fetch the current office location (old city)
    const { data: profile, error: profileError } = await supabase
        .from("Users")
        .select("officeLocation")
        .eq("userId", authUserId)
        .single();

    if (profileError || !profile) {
        return { success: false, error: "Failed to fetch current profile." };
    }

    const oldCity = profile.officeLocation ?? "";

    if (oldCity.toLowerCase() === officeLocation.toLowerCase()) {
        return { success: false, error: "New city must be different from your current city." };
    }

    // Check for existing pending city change request
    const { data: existingPending } = await supabase
        .from("Requests")
        .select("id")
        .eq("userId", authUserId)
        .eq("requestType", "CITY_CHANGE")
        .eq("status", "PENDING")
        .limit(1);

    if (existingPending && existingPending.length > 0) {
        return { success: false, error: "You already have a pending city change request." };
    }

    // Create the city change request
    const { error: requestError } = await supabase.from("Requests").insert({
        userId: authUserId,
        requestType: "CITY_CHANGE" as const,
        status: "PENDING" as const,
        oldCity,
        newCity: officeLocation,
    });

    if (requestError) {
        return { success: false, error: requestError.message };
    }

    // Audit the city change request creation
    await supabase.from("AuditLogs").insert({
        actionType: "CITY_CHANGE_REQUESTED",
        userId: authUserId,
        targetId: authUserId,
    });

    return { success: true };
};

export const addFavourite = async (userId: string, listingId: number): Promise<AuthResponse> => {
    const { error } = await supabase.from("UserFavourites").insert({
        userId,
        listingId,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
};

export const removeFavourite = async (userId: string, listingId: number): Promise<AuthResponse> => {
    const { error } = await supabase.from("UserFavourites").delete()
        .eq("userId", userId)
        .eq("listingId", listingId);
    if (error) return { success: false, error: error.message };
    return { success: true };
};

export const getUserFavourites = async (userId: string): Promise<AuthResponse<number[]>> => {
    const { data, error } = await supabase.from("UserFavourites").select("listingId").eq("userId", userId);
    if (error) return { success: false, error: error.message };
    return { success: true, data: data.map(d => d.listingId) };
};

