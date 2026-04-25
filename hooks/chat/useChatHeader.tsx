import ChatListingSubHeader from "@components/Chat/ChatListingSubHeader";
import ContactActionButtons from "@components/Chat/ContactActionButtons";
import { formatListingPrice } from "@utils/currency";
import { Image, Text, View } from "react-native";
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
  } = details;

  const isListingChat = !!listingId;
  const otherUserName = `${otherUser?.firstName} ${otherUser?.lastName}`;

  const header = (
    <>
      <View className="w-10 h-10 rounded-full bg-fdm-accent/20 border border-fdm-accent/30 items-center justify-center mr-3 overflow-hidden">
        {isListingChat && listingData?.mediaUrls?.[0] ? (
          <Image source={{ uri: listingData.mediaUrls[0] }} style={{ width: 40, height: 40 }} />
        ) : isGroupChat ? (
          <Text className="text-fdm-accent font-bold text-sm">{participantCount} 👥</Text>
        ) : otherUser?.avatarUrl ? (
          <Image source={{ uri: otherUser.avatarUrl }} style={{ width: 40, height: 40 }} />
        ) : (
          <Text className="text-fdm-accent font-bold text-sm">{otherUserName}</Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-fdm-fg text-base font-semibold" numberOfLines={1}>
          {isListingChat ? listingData?.title || "Enquiry" : otherUserName}
        </Text>
        {isListingChat ? (
          <Text className="text-fdm-accent text-xs mt-0.5">
            {listingData ? formatListingPrice(listingData.price, listingData.rentPeriod) : "Loading..."}
          </Text>
        ) : (
          <>
            {isGroupChat ? (
              <Text className="text-fdm-fg/40 text-xs mt-0.5">{participantCount} members</Text>
            ) : otherUser?.phoneNumber ? (
              <Text className="text-fdm-fg/40 text-xs mt-0.5">{otherUser.phoneNumber}</Text>
            ) : otherUser?.email ? (
              <Text className="text-fdm-fg/40 text-xs mt-0.5" numberOfLines={1}>
                {otherUser.email}
              </Text>
            ) : null}
          </>
        )}
      </View>

      {!isListingChat && (
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
