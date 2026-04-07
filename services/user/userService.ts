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
    profilePicture?: string | null,
    expiresInSeconds = 60 * 60
): Promise<string | null> => {
    const source = resolveProfilePictureSource(profilePicture);
    if (source.directUrl) {
        return source.directUrl;
    }

    if (!source.path) {
        return null;
    }

    const cachedUrl = getCachedProfilePictureUrl(source.path);
    if (cachedUrl) {
        return cachedUrl;
    }

    const { data, error } = await supabase.storage
        .from(PROFILE_PICTURE_BUCKET)
        .createSignedUrl(source.path, expiresInSeconds);

    if (error || !data?.signedUrl) {
        return null;
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
