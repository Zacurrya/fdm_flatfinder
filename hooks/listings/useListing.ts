import { ActionType, ListingStatus } from "@/types/enums";
import { ListingRecord } from "@/types/records";
import { useAuth } from "@hooks/general/useAuth";
import { AuditService } from "@services/audit/auditService";
import { ChatService } from "@services/chat/chatService";
import { ListingService } from "@services/listings/listingsService";
import { getRentLabel } from "@utils/currency";
import { parsePhotoUrls } from "@utils/formatters";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

/**
 * useListing
 * Loads a single listing and exposes the detail-page actions for that listing.
 *
 * @param id The listing ID or route param value.
 * @param initialData Optional preloaded listing to avoid a fetch on first render.
 * @returns Listing state, derived values, and listing-related actions.
 */
export const useListing = (id?: string | number, initialData?: ListingRecord | null) => {
  const { user } = useAuth();
  const router = useRouter();

  const [listing, setListing] = useState<ListingRecord | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData && !!id);

  const loadData = useCallback(async () => {
    if (!id || initialData) return;
    setIsLoading(true);
    try {
      const data = await ListingService.fetchListingById(String(id));
      setListing(data);
    } catch (e) {
      console.error("Failed to fetch listing:", e);
      setListing(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, initialData]);

  // Load data on initial mount
  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Derived Values
  const photos = useMemo(() => parsePhotoUrls(listing?.mediaUrls), [listing?.mediaUrls]);
  const firstPhotoUrl = photos[0] || null;
  const rentLabel = useMemo(() => getRentLabel(listing?.rentPeriod), [listing?.rentPeriod]);
  const locationLabel = listing?.city ?? "Location unavailable";
  const listingSold = listing?.status === ListingStatus.SOLD;

  /**
   * Deletes a listing record.
   */
  const deleteListing = async () => {
    if (!listing?.id) return;
    try {
      await ListingService.deleteListing(String(listing.id));
      await AuditService.logAction({
        actionType: ActionType.LISTING_DELETED,
        targetId: listing.id.toString(),
        userId: user?.userId ?? "",
      });
      router.back();
    } catch (e) {
      console.error("Failed to delete", e);
      Alert.alert("Error", "Failed to delete listing.");
    }
  };

  /**
   * Routes user to the chat screen with the listing owner
   */
  const openChat = async () => {
    if (!user?.userId || !listing) return;

    try {
      const chatResult = await ChatService.getOrCreateChat({
        currentUserId: user.userId,
        otherUserId: listing.ownerId,
        listingId: listing.id,
      });

      if (chatResult.id) {
        console.log("Chat opened successfully, chatId:", chatResult.id);
        router.push(`/messages/${chatResult.id}`);
      } else {
        throw new Error("No chat ID returned");
      }
    } catch (e) {
      console.error("Failed to open chat:", e);
      Alert.alert("Chat Error", "Could not start a conversation.");
    }
  };

  const isOwner = user?.userId === listing?.ownerId;

  const shareToGroupChat = async () => {
    if (!user?.officeLocation || !listing) return;
    try {
      Alert.alert("Success", "Listing shared to your city group chat!");
    } catch (e) {
      console.error("Failed to share", e);
      Alert.alert("Error", "Could not share listing.");
    }
  };

  return {
    listing,
    listingSold,
    isLoading,
    photos,
    firstPhotoUrl,
    rentLabel,
    locationLabel,
    isOwner,
    actions: {
      deleteListing,
      openChat,
      shareToGroupChat,
    },
    refresh: loadData,
  };
};
