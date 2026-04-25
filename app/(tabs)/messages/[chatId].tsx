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
  } = details;

  const isLoading = detailsLoading || messagesLoading;

  const { header, subHeader } = useChatHeader(details);

  // Chat send/upload logic
  const { inputProps } = useChatInput(async (content) => {
    if (!user?.userId || !chatId) return;
    await ChatService.sendMessage({ chatId, senderId: user.userId, content });
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
        senderAvatarUrl={isMe ? user?.avatarUrl ?? null : otherUser?.avatarUrl ?? null}
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
