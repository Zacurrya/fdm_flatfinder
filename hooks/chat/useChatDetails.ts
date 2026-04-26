import { ChatService } from "@services/chat/chatService";
import { useEffect, useState } from "react";
import { useListing } from "../listings/useListing";
import { useAuth } from "../general/useAuth";
import { useProfilePicture } from "../useProfilePicture";
import { useUserDetails } from "../useUserDetails";

/**
 * useChatDetails
 * Consolidates metadata, participant details, and listing data for a specific chat.
 */
export const useChatDetails = (chatId: string) => {
  const { user } = useAuth();
  
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [listingId, setListingId] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [chatName, setChatName] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<any | null>(null);

  useEffect(() => {
    if (!chatId || !user?.userId) {
      if (!chatId) console.warn("[useChatDetails] Fetch skipped: No chatId provided.");
      if (!user?.userId) console.warn("[useChatDetails] Fetch skipped: No authenticated user found.");
      return;
    }

    async function fetchMetadata() {
      setIsMetaLoading(true);
      try {
        const chat = await ChatService.getChatMetadata(chatId);
        setListingId(chat.listingId);
        setChatName(chat.displayName);
        const participants = chat.participantIds || [];
        setParticipantCount(participants.length);

        if (participants.length <= 2) {
          const other = participants.find((id) => id !== user?.userId);
          if (other) {
            setOtherUserId(other);
          }
        } else {
          setOtherUserId(null);
        }

        // Fetch display picture
        const pic = await ChatService.getChatDisplayPictureById(chatId, user?.userId || "");
        setImageUrl(pic);

      } catch (error) {
        console.error("[useChatDetails] Failed to fetch chat metadata:", error);
      } finally {
        setIsMetaLoading(false);
      }
    }

    void fetchMetadata();
  }, [chatId, user?.userId]);

  const { userDetails: otherUser, avatarUrl: otherUserAvatarUrl, isLoading: otherUserLoading } = useUserDetails(otherUserId ?? undefined);
  const { avatarUrl: currentUserAvatarUrl, isLoading: currentUserLoading } = useProfilePicture(user?.userId);
  const { listing: listingData, isLoading: listingLoading } = useListing(listingId ?? undefined);

  const isLoading = isMetaLoading || otherUserLoading || currentUserLoading || listingLoading;

  const isGroupChat = participantCount > 2;

  const currentUserName = user ? `${user.firstName} ${user.lastName}` : "Me";
  const otherUserName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "User";

  return {
    isLoading,
    otherUserName,
    currentUserName,
    user,
    otherUser,
    otherUserAvatarUrl,
    currentUserAvatarUrl,
    listingData,
    isGroupChat,
    participantCount,
    listingId,
    imageUrl,
    chatName,
  };
}
