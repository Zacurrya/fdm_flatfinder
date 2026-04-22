import { useAuth } from "@hooks/useAuth";
import * as AuditController from "@services/audit/auditController";
import { getOrCreateChat } from "@services/chat/chatController";
import { getOrCreateCityChatByCity, sendCityChatMessage } from "@services/cityChat/cityChatController";
import { deleteListing as deleteListingService, fetchListingById, Listing } from "@services/listings/listingController";
import { encodeListingShareMessage } from "@utils/chatListingShare";
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
export function useListing(id?: string | number, initialData?: Listing | null) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [listing, setListing] = useState<Listing | null>(initialData || null);
  const [listingSold, setListingSold] = useState(false);
  const [loading, setLoading] = useState(!initialData && !!id);
  const [signedPhotos, setSignedPhotos] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    if (!id || initialData) return;
    setLoading(true);
    try {
      const data = await fetchListingById({ id: Number(id) });
      setListing(data);
      setListingSold(false);
    } catch {
      setListing(null);
      setListingSold(true);
    } finally {
      setLoading(false);
    }
  }, [id, initialData]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Process Photos whenever listing changes
  useEffect(() => {
    if (listing) {
      setSignedPhotos(parsePhotoUrls(listing.photos));
    }
  }, [listing]);

  const rentLabel = useMemo(() => getRentLabel(listing?.rentPeriod), [listing?.rentPeriod]);

  const firstPhotoUrl = useMemo(() => {
    return signedPhotos[0] || null;
  }, [signedPhotos]);

  const locationLabel = useMemo(() => {
    if (!listing) return "Location unavailable";
    const loc = listing.ListingLocations;
    return loc?.address ?? loc?.city ?? "Location unavailable";
  }, [listing]);
  /**
   * 
   * @returns Deletes a listing record.
   */
  const deleteListing = async () => {
    if (!listing?.id) return;
    try {
      await deleteListingService({ id: Number(listing.id) });
      await AuditController.logAudit("LISTING_DELETED", listing.id.toString());
      router.back();
      logger.log("Listing deleted successfully, ID:", listing.id);
    } catch (e) {
      console.error("Failed to delete", e);
      Alert.alert("Error", "Failed to delete listing.");
    }
  };

  /**
   * 
   * @returns and finally sends a message containing the listing details to that chat. It also handles errors and provides user feedback through alerts.
   */
  const shareToGroupChat = async () => {
    if (!user?.userId || !listing) return;

    const cityForChat = (listing as Listing).ListingLocations?.city?.trim() || user.officeLocation?.trim();

    try {
      const cityChatResult = await getOrCreateCityChatByCity({ city: cityForChat });
      if (!cityChatResult.success || !cityChatResult.data) {
        throw new Error(cityChatResult.error ?? "Could not open city chat.");
      }

      const encodedMessage = encodeListingShareMessage(Number(listing.id));
      const sendResult = await sendCityChatMessage({
        cityChatId: cityChatResult.data.id,
        senderId: user.userId,
        content: encodedMessage,
      });

      if (!sendResult.success) {
        throw new Error(sendResult.error ?? "Could not share listing.");
      }

      Alert.alert("Shared", `Listing shared to ${cityForChat} group chat.`, [
        {
          text: "Open Chat",
          onPress: () =>
            router.push(
              `/(tabs)/messages/city/${cityChatResult.data!.id}?city=${encodeURIComponent(cityChatResult.data!.city)}` as any
            ),
        },
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Failed to share to group chat", error);
      Alert.alert("Share Failed", "Could not share listing to group chat.");
    }
  };

  // Routes user to the chat screen with the listing owner
  const openChat = async () => {
    if (!user?.userId || !listing) return;

    try {
      const chatResult = await getOrCreateChat({
        currentUserId: user.userId,
        otherUserId: (listing as Listing).userId,
        listingId: Number(listing.id),
      });

      if (!chatResult.success || !chatResult.data) { throw new Error(chatResult.error ?? "Could not open chat."); }

      router.push(`/(tabs)/messages/${chatResult.data.id}`);
    } catch (error) {
      console.error("Failed to open chat", error);
      Alert.alert("Error", "Could not open chat. Please try again.");
    }
  };

  // Determine if the current user is the owner of the listing for conditional UI rendering
  const isOwner = useMemo(() => {
    if (!user?.userId || !listing) return false;
    return listing.userId === user.userId;
  }, [user?.userId, listing]);

  return {
    listing,
    listingSold,
    loading,
    signedPhotos,
    rentLabel,
    firstPhotoUrl,
    locationLabel,
    actions: {
      deleteListing,
      shareToGroupChat,
      openChat,
    },
    isOwner,
  };
}
