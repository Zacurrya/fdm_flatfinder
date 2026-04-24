import { UserRecord } from "@/types/records";
import { useAuth } from "@hooks/useAuth";
import { useUploadPhotos } from "@hooks/useUploadPhotos";
import { UserService } from "@services/user/userService";
import { useCallback, useEffect, useState } from "react";

/**
 * useProfilePicture
 * Resolves and caches a user's profile picture URL.
 * Handles both UserRecord objects and raw userId strings.
 * Subscribes to realtime updates on the users table so that
 * the picture URL refreshes automatically wherever the hook is used.
 * Also exposes changeProfilePicture and deleteProfilePicture for
 * screens that need mutation capabilities (formerly useProfilePictureManager).
 */
export const useProfilePicture = (user: UserRecord | null | undefined) => {
    const { user: authUser, refreshUser } = useAuth();
    const [profilePictureUri, setProfilePictureUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const userId = user?.userId ?? null;

    const resolveProfilePicture = useCallback(async (forceFetch = false) => {
        if (!user) {
            setProfilePictureUri(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const record = forceFetch
                ? await UserService.getUserRecord(user.userId)
                : user;

            const pic = await UserService.getUserProfilePicture(record);
            setProfilePictureUri(pic);
        } catch (e) {
            console.error("[useProfilePicture] Failed to resolve profile picture:", e);
            setProfilePictureUri(null);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        void resolveProfilePicture();
    }, [resolveProfilePicture]);

    const initials = user
        ? (user.firstName[0] || "") + (user.lastName[0] || "")
        : "";
    const hasProfilePicture = !!(user?.profilePicture);

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

            // Force fetch to bypass stale closure of userOrId
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
            await UserService.removeProfilePicture(userId);
            // If updating current user, refresh the auth context
            if (userId === authUser?.userId) {
                await refreshUser();
            }

            // Force fetch to bypass stale closure of userOrId
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
        profilePictureUri,
        isLoading,
        initials: initials.toUpperCase(),
        hasProfilePicture,
        refresh: resolveProfilePicture,
        // Mutation state & actions
        isUpdating,
        changeProfilePicture,
        deleteProfilePicture,
    };
};
