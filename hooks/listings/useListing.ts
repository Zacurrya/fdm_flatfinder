import { ActionType } from "@/types/enums";
import { Listing } from "@/types/views";
import { useAuth } from "@hooks/useAuth";
import { AuditService } from "@services/audit/auditService";
import { ChatService } from "@services/chat/chatService";
import { ListingService } from "@services/listings/listingsService";
import { getRentLabel } from "@utils/currency";
import { parsePhotoUrls } from "@utils/formatters";
import { logger } from "@utils/logger";
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
export const useListing = (id?: string | number, initialData?: Listing | null) => {
  const { user } = useAuth();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(initialData || null);
  const [listingSold, setListingSold] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialData && !!id);
  const [signedPhotos, setSignedPhotos] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    if (!id || initialData) return;
    setIsLoading(true);
    try {
      const data = await ListingService.fetchListingById(String(id));
      setListing(data);
      setListingSold(false);
    } catch {
      setListing(null);
      setListingSold(true);
    } finally {
      setIsLoading(false);
    }
  }, [id, initialData]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Process Photos whenever listing changes
  useEffect(() => {
    if (listing) {
      setSignedPhotos(parsePhotoUrls(listing.mediaUrls));
    }
  }, [listing]);

  const rentLabel = useMemo(() => getRentLabel(listing?.rentPeriod), [listing?.rentPeriod]);

  const firstPhotoUrl = useMemo(() => {
    return signedPhotos[0] || null;
  }, [signedPhotos]);

  const locationLabel = useMemo(() => {
    if (!listing) return "Location unavailable";
    return listing.city ?? "Location unavailable";
  }, [listing]);
  /**
   * 
   * @returns Deletes a listing record.
   */
  const deleteListing = async () => {
    if (!listing?.id) return;
    try {
      await ListingService.deleteListing(String(listing.id));
      await AuditService.logAction({
        actionType: ActionType.LISTING_DELETED,
        targetId: listing.id.toString(),
        userId: user!.userId,
      });
      router.back();
      logger.log("Listing deleted successfully, ID:", listing.id);
    } catch (e) {
      console.error("Failed to delete", e);
      Alert.alert("Error", "Failed to delete listing.");
    }
  };



  // Routes user to the chat screen with the listing owner
  const openChat = async () => {
    if (!user?.userId || !listing) return;

    try {
      const chatResult = await ChatService.getOrCreateChat({
        currentUserId: user.userId,
        otherUserId: listing.ownerId,
        listingId: listing.id,
      });

      if (!chatResult.success || !chatResult.data) { throw new Error(chatResult.error ?? "Could not open chat."); }

      router.push(`/(tabs)/messages/${chatResult.data.id}`);
    } catch (error) {
      console.error("Failed to open chat", error);
      Alert.alert("Error", "Could not open chat. Please try again.");
    }
  };

  const shareToGroupChat = async () => {
    if (!user?.userId || !listing || !listing.city) return;

    try {
      // Find the city chat
      const chatResult = await ChatService.getChats(user.userId);
      const cityChat = chatResult.find((c) => c.displayName === `${listing.city} Chat`);

      if (!cityChat) {
        Alert.alert("Error", `Could not find a group chat for ${listing.city}.`);
        return;
      }

      const { encodeListingShareMessage } = await import('@utils/chatListingShare');

      await ChatService.sendMessage({
        chatId: cityChat.id,
        senderId: user.userId,
        content: encodeListingShareMessage(String(listing.id)),
        listingId: listing.id as any,
      });

      Alert.alert("Success", `Listing shared to ${listing.city} group chat!`);
      router.push(`/(tabs)/messages/${cityChat.id}`);
    } catch (error) {
      console.error("Failed to share listing", error);
      Alert.alert("Error", "Could not share listing. Please try again.");
    }
  };

  // Determine if the current user is the owner of the listing for conditional UI rendering
  const isOwner = useMemo(() => {
    if (!user?.userId || !listing) return false;
    return listing.ownerId === user.userId;
  }, [user?.userId, listing]);

  return {
    listing,
    listingSold,
    isLoading,
    signedPhotos,
    rentLabel,
    firstPhotoUrl,
    locationLabel,
    actions: {
      deleteListing,
      openChat,
      shareToGroupChat,
    },
    isOwner,
  };
}
