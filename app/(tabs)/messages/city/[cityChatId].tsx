import ChatScreenLayout from "@components/Chat/ChatScreenLayout";
import GroupChatHeader from "@components/Chat/GroupChatHeader";
import MessageBuilder from "@components/Chat/MessageTypes/MessageBuilder";
import { useAuth } from "@hooks/useAuth";
import { useChatInput } from "@hooks/useChatInput";
import { DecoratedChatMessage } from "@hooks/useChatMessages";
import {
  getCityChatParticipantCount,
  sendCityChatMessage,
} from "@services/cityChat/cityChatController";
import { formatTime, getInitials } from "@utils/formatters";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";

export default function CityChatScreen() {
  const { cityChatId, city } = useLocalSearchParams<{ cityChatId: string; city?: string }>();
  const { user } = useAuth();

  const parsedCityChatId = Number(cityChatId);
  const cityLabel = typeof city === "string" && city.trim() ? decodeURIComponent(city) : "City";
  const isValidId = Number.isFinite(parsedCityChatId) && parsedCityChatId > 0;

  const [participantCount, setParticipantCount] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);

  // Chat send/upload logic
  const { inputProps } = useChatInput(async (content) => {
    if (!user?.userId || !isValidId) return;
    const result = await sendCityChatMessage({
      cityChatId: parsedCityChatId,
      senderId: user.userId,
      content,
    });
    if (!result.success) throw new Error(result.error ?? "Failed to send city chat message.");
  });

  // Load participant count
  useEffect(() => {
    if (!isValidId) return;

    const loadData = async () => {
      try {
        const countResult = await getCityChatParticipantCount({ cityChatId: parsedCityChatId });
        if (countResult.success && countResult.data !== undefined) {
          setParticipantCount(countResult.data);
        }
      } catch (error) {
        console.error("Failed to load city chat details:", error);
      }
    };

    void loadData();
  }, [isValidId, parsedCityChatId]);

  const renderMessage = (item: DecoratedChatMessage, _index: number) => {
    const isMe = item.sender_id === user?.userId;
    const senderName = item.senderName || "Consultant";
    const senderInitials = getInitials(senderName);
    const showSenderMeta = !isMe && !item.isPreviousFromSameSender;

    return (
      <MessageBuilder
        content={item.content}
        timeLabel={formatTime(item.createdAt)}
        isMe={isMe}
        senderName={senderName}
        showSenderName={showSenderMeta}
        createdAt={item.createdAt}
        showDateSeparator={item.showDateSeparator}
        avatarProfilePicture={item.senderProfilePicture}
        avatarInitials={senderInitials}
        avatarVisible={showSenderMeta}
      />
    );
  };

  const headerContent = (
    <GroupChatHeader cityLabel={cityLabel} participantCount={participantCount} />
  );

  return (
    <ChatScreenLayout
      chatId={parsedCityChatId}
      source="CITY"
      headerContent={headerContent}
      flatListRef={flatListRef}
      renderMessage={renderMessage}
      inputProps={{...inputProps}}
    />
  );
}
