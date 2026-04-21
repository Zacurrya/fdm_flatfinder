import {
  getConversationDetails,
  OtherUserProfile,
} from "@services/chat/chatController";
import { Listing } from "@services/listings/listingController";
import { useEffect, useState } from "react";

/**
 * useConversationDetails
 * Fetches the other user's profile and the associated listing metadata
 * for a given private conversation. Extracted from [conversationId].tsx
 * to keep the screen lean and make this data independently reusable.
 */
export function useConversationDetails(
  conversationId: string | undefined,
  userId: string | undefined
) {
  const [otherUser, setOtherUser] = useState<OtherUserProfile | null>(null);
  const [listingData, setListingData] = useState<Listing | null>(null);
  const [listingId, setListingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId || !userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const result = await getConversationDetails({
          conversationId,
          currentUserId: userId,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error ?? "Failed to load conversation details.");
        }

        setOtherUser(result.data.otherUser);
        setListingData(result.data.listing);
        setListingId(result.data.listingId);
      } catch (error) {
        console.error("[useConversationDetails] Failed:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [conversationId, userId]);

  return { otherUser, listingData, listingId, loading };
}
