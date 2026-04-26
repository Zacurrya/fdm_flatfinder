import { useAuth } from "@hooks/general/useAuth";
import { UserService } from "@services/user/userService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useMemo } from "react";

export type SavedListingsContextType = {
    savedListingIds: string[];
    isLoading: boolean;
    refreshFavourites: (force?: boolean) => Promise<void>;
    toggleFavourite: (listingId: string) => Promise<void>;
};

export const SavedListingsContext = createContext<SavedListingsContextType | undefined>(undefined);

export const SavedListingsProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: savedListingIds = [], isLoading, refetch } = useQuery({
        queryKey: ["savedListingIds", user?.userId],
        queryFn: async () => {
            if (!user?.userId) return [];
            return await UserService.getSavedListingIds(user.userId);
        },
        enabled: !!user?.userId,
    });

    const mutation = useMutation({
        mutationFn: async (listingId: string) => {
            if (!user?.userId) return;
            const isFav = savedListingIds.includes(listingId);
            if (isFav) {
                await UserService.removeSavedListing(user.userId, listingId);
            } else {
                await UserService.addSavedListing(user.userId, listingId);
            }
        },
        onMutate: async (listingId) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ["savedListingIds", user?.userId] });

            // Snapshot the previous value
            const previousIds = queryClient.getQueryData<string[]>(["savedListingIds", user?.userId]);

            // Optimistically update to the new value
            if (previousIds) {
                const isFav = previousIds.includes(listingId);
                const nextIds = isFav
                    ? previousIds.filter(id => id !== listingId)
                    : [...previousIds, listingId];

                queryClient.setQueryData(["savedListingIds", user?.userId], nextIds);
            }

            return { previousIds };
        },
        onError: (err, _, context) => {
            // Revert to the snapshot on error
            if (context?.previousIds) {
                queryClient.setQueryData(["savedListingIds", user?.userId], context.previousIds);
            }
            console.error("[SavedListings] Mutation failed:", err);
        },
        onSettled: () => {
            // Always refetch after error or success to keep server state in sync
            queryClient.invalidateQueries({ queryKey: ["savedListingIds", user?.userId] });
        },
    });

    const refreshFavourites = async () => {
        await refetch();
    };

    const toggleFavourite = async (listingId: string) => {
        await mutation.mutateAsync(listingId);
    };

    const value = useMemo(() => ({
        savedListingIds,
        isLoading,
        refreshFavourites,
        toggleFavourite,
    }), [savedListingIds, isLoading, refetch, mutation.mutateAsync]);

    return (
        <SavedListingsContext.Provider value={value}>
            {children}
        </SavedListingsContext.Provider>
    );
};
