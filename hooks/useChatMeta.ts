import { getChatMeta } from "@services/chat/chatController";
import { useEffect, useState } from "react";

/**
 * useChatMeta
 * Resolves the chat metadata needed to render a private chat screen.
 *
 * @param chatId The chat ID from the route.
 * @param userId The current user's ID, used to derive the other participant.
 * @returns The other user's ID, linked listing ID, and loading state.
 */
export function useChatMeta(
  chatId: string | undefined,
  userId: string | undefined
) {
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [listingId, setListingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If missing params, clear state and stop loading
    if (!chatId || !userId) {
      setOtherUserId(null);
      setListingId(null);
      setLoading(false);
      return;
    }

    let isMounted = true; // Guard flag

    const loadMeta = async () => {
      setLoading(true);
      try {
        const result = await getChatMeta({
          chatId,
          currentUserId: userId,
        });

        // Exit early if the component unmounted or ID changed while fetching
        if (!isMounted) return;

        if (!result.success || !result.data) {
          throw new Error(result.error ?? "Failed to load chat meta.");
        }

        setOtherUserId(result.data.otherUserId);
        setListingId(result.data.listingId);
      } catch (error) {
        if (!isMounted) return;
        
        console.error("[useChatMeta] Failed:", error);
        setOtherUserId(null);
        setListingId(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadMeta();

    return () => {
      isMounted = false;
    };
  }, [chatId, userId]);

  return { otherUserId, listingId, loading };
}