import { useAuth } from "@hooks/useAuth";
import { addFavourite, getUserFavourites, removeFavourite } from "@services/user/userController";
import { logger } from "@utils/logger";
import { useCallback, useEffect, useState } from "react";
import { useRealtime } from "./useRealtime";

type FavouriteRow = {
    listingId: number;
};

/**
 * useSavedListings
 * Manages the current user's favourite listing IDs, realtime sync, and toggle actions.
 *
 * @returns Favourite listing IDs, loading state, refresh, and toggle helpers.
 */
export function useSavedListings() {
    const { user } = useAuth();
    const [savedListingIds, setSavedListingIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshFavourites = useCallback(async () => {
        if (!user?.userId) {
            setSavedListingIds([]);
            setLoading(false);
            return;
        }

        try {
            const result = await getUserFavourites(user.userId);
            setSavedListingIds(result.success ? result.data ?? [] : []);
        } catch (error) {
            console.error("Failed to fetch favourites:", error);
            setSavedListingIds([]);
        } finally {
            setLoading(false);
        }
    }, [user?.userId]);

    useEffect(() => {
        setLoading(true);
        void refreshFavourites();
    }, [refreshFavourites]);

    /**
     *  Subscribes to changes in the Favourites table for the current user to keep the saved listings upto date in real-time
    */
    useRealtime<FavouriteRow>(
        "Favourites",
        {
            filter: user?.userId ? { column: "userId", value: user.userId } : undefined,
            onInsert: (newRecord) => {
                setSavedListingIds((prev) =>
                    prev.includes(newRecord.listingId) ? prev : [...prev, newRecord.listingId]
                );
            },
            onDelete: (deletedRecord) => {
                setSavedListingIds((prev) => prev.filter((id) => id !== deletedRecord.listingId));
            },
            enabled: !!user?.userId,
        }
    );
    /**
     * Toggles a listing as favourite or not for the current user. It optimistically updates the local state for a responsive UI, and then calls the appropriate API to persist the change. If the API call fails, it rolls back the local state change.
     */
    const toggleFavourite = useCallback(
        async (listingId: string | number) => {
            if (!user?.userId) return;

            const lId = Number(listingId);
            const isFaved = savedListingIds.includes(lId);

            if (isFaved) {
                logger.log("Unfavouriting listing ID:", lId);
                setSavedListingIds((prev) => prev.filter((id) => id !== lId));
                const result = await removeFavourite(user.userId, lId);
                if (!result.success) {
                    setSavedListingIds((prev) => (prev.includes(lId) ? prev : [...prev, lId]));
                }
            } else {
                logger.log("Favouriting listing ID:", lId);
                setSavedListingIds((prev) => (prev.includes(lId) ? prev : [...prev, lId]));
                const result = await addFavourite(user.userId, lId);
                if (!result.success) {
                    setSavedListingIds((prev) => prev.filter((id) => id !== lId));
                }
            }
        },
        [user?.userId, savedListingIds]
    );

    return {
        favIds: savedListingIds,
        loadingFavourites: loading,
        refreshFavourites,
        toggleFavourite,
    };
}