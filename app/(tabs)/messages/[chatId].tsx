import ChatListingSubHeader from "@components/Chat/ChatListingSubHeader";
import ChatScreenLayout from "@components/Chat/ChatScreenLayout";
import ContactActionButtons from "@components/Chat/ContactActionButtons";
import MessageBuilder from "@components/Chat/MessageTypes/MessageBuilder";
import FDMLoader from "@components/ui/FDMLoader";
import { useAuth } from "@hooks/useAuth";
import { useChatInput } from "@hooks/useChatInput";
import { DecoratedChatMessage } from "@hooks/useChatMessages";
import { useChatMeta } from "@hooks/useChatMeta";
import { useListing } from "@hooks/useListing";
import { useUserDetails } from "@hooks/useUserDetails";
import { sendMessage } from "@services/chat/chatController";
import { formatTime, getInitials } from "@utils/formatters";
import { useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { FlatList, Image, Text, View } from "react-native";

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const { otherUserId, listingId, loading: metaLoading } = useChatMeta(
    chatId,
    user?.userId
  );
  const { userDetails: otherUser, loading: otherUserLoading } = useUserDetails(otherUserId);
  const { listing: listingData, loading: listingLoading } = useListing(listingId ?? undefined);
  const loading = metaLoading || otherUserLoading || listingLoading;

  // Chat send/upload logic
  const { inputProps } = useChatInput(async (content) => {
    if (!user?.userId || !chatId) return;
    const result = await sendMessage({ chatId, senderId: user.userId, content });
    if (!result.success) throw new Error(result.error ?? "Failed to send message.");
  });

  // Derived display values
  const otherUserName = otherUser
    ? [otherUser.firstName, otherUser.lastName].filter(Boolean).join(" ") || "User"
    : "Chat";
  const initials = getInitials(otherUserName);
  const currentUserName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  const currentUserInitials = getInitials(currentUserName);

  const renderMessage = (item: DecoratedChatMessage, _index: number) => {
    const isMe = item.sender_id === user?.userId;
    const senderName = isMe ? currentUserName : otherUserName;
    const senderProfilePicture = isMe ? user?.profilePicture ?? null : otherUser?.profilePicture ?? null;
    const senderInitials = isMe ? currentUserInitials : initials;
    return (
      <MessageBuilder
        content={item.content}
        timeLabel={formatTime(item.createdAt)} // Used for HH:MM message timestamp
        isMe={isMe}
        senderName={senderName}
        showSenderName={false}
        createdAt={item.createdAt}
        showDateSeparator={item.showDateSeparator}
        avatarProfilePicture={senderProfilePicture}
        avatarInitials={senderInitials}
        avatarVisible={!isMe && !item.isPreviousFromSameSender} // Only render other user's avatars
      />
    );
  };

  const headerContent = (
    <>
      <View className="w-10 h-10 rounded-full bg-fdm-accent/20 border border-fdm-accent/30 items-center justify-center mr-3 overflow-hidden">
        {otherUser?.profilePicture ? (
          <Image source={{ uri: otherUser.profilePicture }} style={{ width: 40, height: 40 }} />
        ) : (
          <Text className="text-fdm-accent font-bold text-sm">{initials}</Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-fdm-fg text-base font-semibold" numberOfLines={1}>
          {otherUserName}
        </Text>
        {otherUser?.phoneNumber ? (
          <Text className="text-fdm-fg/40 text-xs mt-0.5">{otherUser.phoneNumber}</Text>
        ) : otherUser?.email ? (
          <Text className="text-fdm-fg/40 text-xs mt-0.5" numberOfLines={1}>
            {otherUser.email}
          </Text>
        ) : null}
      </View>

      <ContactActionButtons
        phoneNumber={otherUser?.phoneNumber}
        email={otherUser?.email}
      />
    </>
  );

  return (
    <View style={{ flex: 1 }}>
      {loading && <FDMLoader />}
      <ChatScreenLayout
        chatId={chatId}
        source="PRIVATE"
        headerContent={headerContent}
        subHeader={<ChatListingSubHeader listingId={listingId ?? undefined} initialData={listingData} />}
        flatListRef={flatListRef}
        renderMessage={renderMessage}
        listEmptyText="Send a message to get started"
        inputProps={{ ...inputProps, }}
      />
    </View>
  );
}
