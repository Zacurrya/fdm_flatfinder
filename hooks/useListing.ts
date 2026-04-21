import { useAuth } from "@context/AuthContext";
import * as AuditController from "@services/audit/auditController";
import { getOrCreateConversation } from "@services/chat/chatController";
import { getOrCreateCityChatByCity, sendCityChatMessage } from "@services/cityChat/cityChatController";
import { deleteListing as deleteListingService, fetchListingById, Listing } from "@services/listings/listingController";
import { encodeListingShareMessage } from "@utils/chatListingShare";
import { getRentLabel } from "@utils/currency";
import { parsePhotoUrls } from "@utils/formatters";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

export function useListing(id?: string | number, initialData?: Listing | null) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [listing, setListing] = useState<Listing | null>(initialData || null);
  const [listingSold, setListingSold] = useState(false);
  const [loading, setLoading] = useState(!initialData && !!id);
  const [signedPhotos, setSignedPhotos] = useState<string[]>([]);

  // Sync state if initialData arrives later (async)
  useEffect(() => {
    if (initialData) {
      setListing(initialData);
      setListingSold(false);
      setLoading(false);
    }
  }, [initialData]);

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

  const deleteListing = async () => {
    if (!listing?.id) return;
    try {
      await deleteListingService({ id: Number(listing.id) });
      await AuditController.logAudit("LISTING_DELETED", listing.id.toString());
      router.back();
    } catch (e) {
      console.error("Failed to delete", e);
      Alert.alert("Error", "Failed to delete listing.");
    }
  };

  const shareToGroupChat = async () => {
    if (!user?.userId || !listing) return;

    const cityForChat = (listing as Listing).ListingLocations?.city?.trim() || user.officeLocation?.trim();
    if (!cityForChat) {
      Alert.alert("Share Failed", "No city found for this listing.");
      return;
    }

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

  const openConversation = async () => {
    if (!user?.userId || !listing) return;

    try {
      const conversationResult = await getOrCreateConversation({
        currentUserId: user.userId,
        otherUserId: (listing as Listing).userId,
        listingId: Number(listing.id),
      });

      if (!conversationResult.success || !conversationResult.data) {
        throw new Error(conversationResult.error ?? "Could not open conversation.");
      }

      router.push(`/(tabs)/messages/${conversationResult.data.id}` as any);
    } catch (error) {
      console.error("Failed to open conversation", error);
      Alert.alert("Error", "Could not open chat. Please try again.");
    }
  };

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
      openConversation,
    },
    isOwner,
  };
}
