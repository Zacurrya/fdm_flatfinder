import { useListing } from "@hooks/listings/useListing";
import { getCityImagePath } from "@lib/office-cities";
import { ChatService } from "@services/chat/chatService";
import { useEffect, useState } from "react";

/**
 * useChatMeta
 * Hook to fetch metadata for a specific chat.
 */
export const useChatMetadata = (chatId: string, currentUserId?: string) => {
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [listingId, setListingId] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [chatName, setChatName] = useState<string | null>(null);

  const { listing } = useListing(listingId ?? undefined);

  useEffect(() => {
    if (!chatId) return;

    async function fetchMetadata() {
      setIsLoading(true);
      try {
        const chat = await ChatService.getChatMetadata(chatId);
        setListingId(chat.listing_id);
        setChatName(chat.display_name);
        const participants = chat.participants || [];
        setParticipantCount(participants.length);

        if (participants.length <= 2) {
          const other = participants.find((p: any) => p.user_id !== currentUserId);
          if (other) {
            setOtherUserId(other.user_id);
          }
        } else {
          setOtherUserId(null);
        }
      } catch (error) {
        console.error("[useChatMeta] Failed to fetch chat metadata:", error);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchMetadata();
  }, [chatId, currentUserId]);

  let imageUrl = null;
  const cityImagePath = chatName ? getCityImagePath(chatName) : null;

  if (cityImagePath) {
    imageUrl = cityImagePath;
  } else if (listingId && listing?.mediaUrls?.[0]) {
    imageUrl = listing.mediaUrls[0];
  }

  return { otherUserId, listingId, participantCount, isLoading, imageUrl };
}
