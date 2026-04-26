import ChatListingSubHeader from "@components/Chat/ChatListingSubHeader";
import ContactActionButtons from "@components/Chat/ContactActionButtons";
import ProfilePic from "@components/profile/ProfilePic";
import { Text, View } from "react-native";
import { useChatDetails } from "./useChatDetails";

/**
 * Decides how to render the header and subheader in the chat layout.
 * If a chat has a listingId, it's treated as a listings chat.
 */
export const useChatHeader = (details: ReturnType<typeof useChatDetails>) => {
  const {
    listingId,
    listingData,
    otherUser,
    isGroupChat,
    participantCount,
    imageUrl,
    chatName,
  } = details;

  const isListingChat = !!listingId;
  const otherUserName = `${otherUser?.firstName} ${otherUser?.lastName}`;

  const header = (
    <>
      <View className="mr-3">
        <ProfilePic
          avatarUrl={imageUrl}
          size={40}
        />
      </View>

      <View className="flex-1">
        <Text className="text-fdm-fg text-base font-semibold" numberOfLines={1}>
          {chatName || (isGroupChat ? (listingData?.title || "Group Chat") : otherUserName)}
        </Text>
        
        <View>
          {isGroupChat ? (
            <Text className="text-fdm-fg/40 text-xs mt-0.5">{participantCount} members</Text>
          ) : (
            <>
              {otherUser?.phoneNumber ? (
                <Text className="text-fdm-fg/40 text-xs mt-0.5">{otherUser.phoneNumber}</Text>
              ) : otherUser?.email ? (
                <Text className="text-fdm-fg/40 text-xs mt-0.5" numberOfLines={1}>
                  {otherUser.email}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </View>

      {!isGroupChat && (
        <ContactActionButtons
          phoneNumber={otherUser?.phoneNumber}
          email={otherUser?.email}
        />
      )}
    </>
  );

  const subHeader = isListingChat ? (
    <ChatListingSubHeader listingId={listingId ?? undefined} initialData={listingData} />
  ) : null;

  return {
    header,
    subHeader,
  };
}
