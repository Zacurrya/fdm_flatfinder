import ChatListingSubHeader from "@components/Chat/ChatListingSubHeader";
import ChatScreenLayout from "@components/Chat/ChatScreenLayout";
import ContactActionButtons from "@components/Chat/ContactActionButtons";
import MessageBuilder from "@components/Chat/MessageTypes/MessageBuilder";
import FDMLoader from "@components/ui/FDMLoader";
import { useAuth } from "@context/AuthContext";
import { useChatInput } from "@hooks/useChatInput";
import { useConversationDetails } from "@hooks/useConversationDetails";
import { DecoratedChatMessage } from "@hooks/useChatMessages";
import { sendMessage } from "@services/chat/chatController";
import { formatTime, getInitials } from "@utils/formatters";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef } from "react";
import { FlatList, Image, Text, View } from "react-native";

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  // Conversation metadata
  const { otherUser, listingData, loading } = useConversationDetails(conversationId, user?.userId);

  // Chat send/upload logic
  const { inputProps } = useChatInput(async (content) => {
    if (!user?.userId || !conversationId) return;
    const result = await sendMessage({ conversationId, senderId: user.userId, content });
    if (!result.success) throw new Error(result.error ?? "Failed to send message.");
  });

  // Derived display values
  const otherUserName = otherUser
    ? [otherUser.firstName, otherUser.lastName].filter(Boolean).join(" ") || "User"
    : "Chat";
  const initials = getInitials(otherUserName);

  const renderMessage = (item: DecoratedChatMessage, _index: number) => {
    const isMe = item.senderId === user?.userId;
    return (
      <MessageBuilder
        content={item.content}
        timeLabel={formatTime(item.createdAt)}
        isMe={isMe}
        senderName={otherUserName}
        showSenderName={false}
        createdAt={item.createdAt}
        showDateSeparator={item.showDateSeparator}
        avatarProfilePicture={otherUser?.profilePicture}
        avatarInitials={initials}
        avatarVisible={!isMe && !item.isPreviousFromSameSender}
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
        chatId={conversationId}
        source="PRIVATE"
        headerContent={headerContent}
        subHeader={<ChatListingSubHeader initialData={listingData} />}
        flatListRef={flatListRef}
        renderMessage={renderMessage}
        listEmptyText="Send a message to get started"
        inputProps={{
          ...inputProps,
          placeholder: inputProps.attachment ? "Add a caption..." : "Message...",
        }}
      />
    </View>
  );
}
