import { MessageRecord } from "@/types/records";
import ChatScreenLayout from "@components/Chat/ChatScreenLayout";
import { Message } from "@components/Chat/Message";
import FDMLoader from "@components/ui/FDMLoader";
import { useChatDetails } from "@hooks/chat/useChatDetails";
import { useChatHeader } from "@hooks/chat/useChatHeader";
import { useChatInput } from "@hooks/chat/useChatInput";
import { useChatMessages } from "@hooks/chat/useChatMessages";
import { ChatService } from "@services/chat/chatService";
import { useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
import { FlatList, View } from "react-native";

const ChatScreen = () => {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const flatListRef = useRef<FlatList>(null);

  const details = useChatDetails(chatId);
  const { messages, isLoading: messagesLoading } = useChatMessages(chatId);

  const {
    isLoading: detailsLoading,
    otherUserName,
    currentUserName,
    user,
    otherUser,
    otherUserAvatarUrl,
    currentUserAvatarUrl,
  } = details;

  const isLoading = detailsLoading || messagesLoading;

  const { header, subHeader } = useChatHeader(details);

  // Chat send/upload logic
  const { inputProps } = useChatInput(async (content) => {
    if (!user?.userId || !chatId) return;
    try {
      await ChatService.sendMessage({ chatId, senderId: user.userId, content });
      console.log(`[ChatScreen] Message sent to chat ${chatId}`);
    } catch (err) {
      console.error("[ChatScreen] Failed to send message:", err);
      throw err;
    }
  });

  const renderMessage = (item: MessageRecord, index: number) => {
    const isMe = item.senderId === user?.userId;

    const prevMsg = index > 0 ? messages[index - 1] : null;
    const isPreviousFromSameSender = prevMsg?.senderId === item.senderId;

    let showDateSeparator = false;
    if (!prevMsg) {
      showDateSeparator = true;
    } else {
      const prevDate = new Date(prevMsg.createdAt).toDateString();
      const currDate = new Date(item.createdAt).toDateString();
      showDateSeparator = prevDate !== currDate;
    }

    return (
      <Message
        item={item}
        isMe={isMe}
        senderName={isMe ? currentUserName : otherUserName}
        senderAvatarUrl={isMe ? currentUserAvatarUrl : otherUserAvatarUrl}
        showDateSeparator={showDateSeparator}
        isPreviousFromSameSender={isPreviousFromSameSender}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {isLoading && <FDMLoader />}
      <ChatScreenLayout
        chatId={chatId}
        headerContent={header}
        subHeader={subHeader}
        flatListRef={flatListRef}
        renderMessage={renderMessage}
        messages={messages}
        isLoading={isLoading}
        listEmptyText="Send a message to get started"
        inputProps={{ ...inputProps, }}
      />
    </View>
  );
};

export default ChatScreen;
