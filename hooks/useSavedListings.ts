import { UserService } from "@services/user/userService";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export const useSavedListings = () => {
    const { user } = useAuth();
    const [favIds, setFavIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const refreshFavourites = useCallback(async () => {
        if (!user?.userId) {
            setFavIds([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const ids = await UserService.getSavedListings(user.userId);
            setFavIds(ids);
        } finally {
            setIsLoading(false);
        }
    }, [user?.userId]);

    useEffect(() => {
        void refreshFavourites();
    }, [refreshFavourites]);

    const toggleFavourite = useCallback(async (listingId: string) => {
        if (!user?.userId) return;
        const isFav = favIds.includes(listingId);
        if (isFav) {
            await UserService.removeSavedListing(user.userId, listingId);
            setFavIds((prev) => prev.filter((id) => id !== listingId));
        } else {
            await UserService.addSavedListing(user.userId, listingId);
            setFavIds((prev) => [...prev, listingId]);
        }
    }, [favIds, user?.userId]);

    return { favIds, isLoading, refreshFavourites, toggleFavourite };
}