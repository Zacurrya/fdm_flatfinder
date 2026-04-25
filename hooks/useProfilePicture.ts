import { UserRecord } from "@/types/records";
import { useAuth } from "@hooks/useAuth";
import { useUploadPhotos } from "@hooks/useUploadPhotos";
import { UserService } from "@services/user/userService";
import { useCallback, useEffect, useState } from "react";

/**
 * Resolves and caches a user's profile picture URL.
 */
export const useProfilePicture = (userId?: string | null) => {
    const { user: authUser, refreshUser } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [resolvedUser, setResolvedUser] = useState<UserRecord | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Initial resolution of the user record
    const fetchUserRecord = useCallback(async () => {
        // Default to current auth user
        if (!userId) {
            setResolvedUser(authUser);
            return;
        }

        // If null passed, we have no user
        if (userId === null) {
            setResolvedUser(null);
            console.log("[useProfilePicture] No user ID passed")
            return;
        }

        // Resolve the ID
        if (userId) {
            try {
                const record = await UserService.getUserRecord(userId);
                setResolvedUser(record);
            } catch (e) {
                console.error("[useProfilePicture] Failed to fetch user record:", e);
                setResolvedUser(null);
            }
        }
    }, [userId, authUser]);

    useEffect(() => {
        void fetchUserRecord();
    }, [fetchUserRecord]);

    const resolveProfilePicture = useCallback(async (forceFetch = false) => {
        let target = resolvedUser;

        if (forceFetch && typeof userId === "string") {
            try {
                target = await UserService.getUserRecord(userId);
            } catch (e) {
                console.error("[useProfilePicture] Force fetch failed:", e);
            }
        }

        if (!target) {
            setAvatarUrl(null);
            return;
        }

        setIsLoading(true);
        try {
            const pic = await UserService.getUserProfilePicture(target);
            setAvatarUrl(pic);
            if (forceFetch) setResolvedUser(target);
        } catch (e) {
            console.error("[useProfilePicture] Failed to resolve profile picture:", e);
            setAvatarUrl(null);
        } finally {
            setIsLoading(false);
        }
    }, [resolvedUser, userId]);

    useEffect(() => {
        if (resolvedUser) {
            void resolveProfilePicture();
        } else {
            setAvatarUrl(null);
        }
    }, [resolvedUser, resolveProfilePicture]);

    const hasProfilePicture = !!(resolvedUser?.avatarUrl);

    const { pickImages } = useUploadPhotos({ bucket: "profile-pictures", multiple: false, squareCrop: true, quality: 0.5 });

    /**
     * Handles the selection and upload of a new profile picture.
     */
    const changeProfilePicture = async () => {
        if (!userId) return { success: false, error: "No user logged in" };

        try {
            const uris = await pickImages();
            if (uris.length === 0) return { success: false, error: "Cancelled" };

            setIsUpdating(true);
            const selectedUri = uris[0];

            await UserService.uploadProfilePicture(userId, {
                imageUri: selectedUri,
            });

            // If updating current user, refresh the auth context
            if (userId === authUser?.userId) {
                await refreshUser();
            }

            // Force fetch to bypass stale closure
            await resolveProfilePicture(true);

            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message };
        } finally {
            setIsUpdating(false);
        }
    };

    /**
     * Handles the removal of the current profile picture.
     */
    const deleteProfilePicture = async () => {
        if (!userId) return { success: false, error: "No user logged in" };

        setIsUpdating(true);
        try {
            await UserService.deleteProfilePicture(userId);
            // If updating current user, refresh the auth context
            if (userId === authUser?.userId) {
                await refreshUser();
            }

            // Force fetch to bypass stale closure
            await resolveProfilePicture(true);

            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message };
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        // Picture state
        avatarUrl,
        isLoading,
        hasProfilePicture,
        refresh: resolveProfilePicture,
        // Mutation state & actions
        isUpdating,
        changeProfilePicture,
        deleteProfilePicture,
    };
};
