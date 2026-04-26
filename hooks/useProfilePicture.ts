import { UserRecord } from "@/types/records";
import { useAuth } from "@hooks/general/useAuth";
import { useUploadPhotos } from "@hooks/useUploadPhotos";
import { UserService } from "@services/user/userService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

/**
 * useProfilePicture
 * 
 * Resolves a user's profile picture URL.
 * Uses TanStack Query for efficient record caching.
 */
export const useProfilePicture = (userId?: string | null) => {
    const { user: authUser, refreshUser } = useAuth();
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);

    // Sync authUser to the query cache when it changes, to ensure UI is always fresh
    useEffect(() => {
        if (authUser && (!userId || userId === authUser.userId)) {
            queryClient.setQueryData(UserService.queryKeys.user(authUser.userId), authUser);
        }
    }, [authUser, userId, queryClient]);

    // Case 1: Fetching current auth user's record
    // Case 2: Fetching another user's record
    const { data: userRecord, isLoading: recordLoading } = useQuery({
        queryKey: UserService.queryKeys.user(userId || authUser?.userId || ""),
        queryFn: () => UserService.getUserRecord(userId || authUser?.userId || ""),
        enabled: !!(userId || authUser?.userId),
        // If it's the auth user, we default to the auth context data
        initialData: (userId === authUser?.userId || !userId) ? authUser : undefined,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });

    // Resolve URL synchronously
    const avatarUrl = useMemo(() => 
        userRecord ? UserService.getUserProfilePicture(userRecord) : null
    , [userRecord]);

    const { pickImages } = useUploadPhotos({ bucket: "profile-pictures", multiple: false, squareCrop: true, quality: 0.5 });

    /**
     * Handles the selection and upload of a new profile picture.
     */
    const changeProfilePicture = async () => {
        const targetId = userId || authUser?.userId;
        if (!targetId) throw new Error("No user context");

        try {
            const uris = await pickImages();
            if (uris.length === 0) return;

            setIsUpdating(true);
            await UserService.uploadProfilePicture(targetId, { imageUri: uris[0] });

            if (targetId === authUser?.userId) {
                await refreshUser();
            }
        } catch (e: any) {
            console.error("[useProfilePicture] Upload failed:", e);
            throw e;
        } finally {
            setIsUpdating(false);
        }
    };

    /**
     * Handles the removal of the current profile picture.
     */
    const deleteProfilePicture = async () => {
        const targetId = userId || authUser?.userId;
        if (!targetId) throw new Error("No user context");

        setIsUpdating(true);
        try {
            await UserService.deleteProfilePicture(targetId);
            if (targetId === authUser?.userId) {
                await refreshUser();
            }
        } catch (e: any) {
            console.error("[useProfilePicture] Delete failed:", e);
            throw e;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        avatarUrl,
        isLoading: recordLoading,
        isUpdating,
        changeProfilePicture,
        deleteProfilePicture,
    };
};
