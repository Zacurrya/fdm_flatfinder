import { getInitials } from "@utils/formatters";
import { useListing } from "../listings/useListing";
import { useAuth } from "../useAuth";
import { useUserDetails } from "../useUserDetails";
import { useChatMetadata } from "./useChatMetadata";

export const useChatDetails = (chatId: string) => {
  const { user } = useAuth();
  const { otherUserId, listingId, participantCount, isLoading: metaLoading, imageUrl } = useChatMetadata(chatId, user?.userId);

  const { userDetails: otherUser, isLoading: otherUserLoading } = useUserDetails(otherUserId ?? undefined);
  const { listing: listingData, isLoading: listingLoading } = useListing(listingId ?? undefined);

  const isLoading = metaLoading || otherUserLoading || listingLoading;

  const isGroupChat = participantCount > 2;

  const currentUserName = user ? `${user.firstName} ${user.lastName}` : "Me";
  const currentUserInitials = getInitials(currentUserName);

  const otherUserName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "User";
  const initials = getInitials(otherUserName);

  return {
    isLoading,
    otherUserName,
    initials,
    currentUserName,
    currentUserInitials,
    user,
    otherUser,
    listingData,
    isGroupChat,
    participantCount,
    listingId,
    imageUrl,
  };
}
