import ChatScreenLayout from "@components/Chat/ChatScreenLayout";
import MessageBuilder from "@components/Chat/MessageTypes/MessageBuilder";
import CityImage from "@components/ui/CityImage";
import { useAuth } from "@context/AuthContext";
import { useChatInput } from "@hooks/useChatInput";
import { DecoratedChatMessage } from "@hooks/useChatMessages";
import {
  getCityChatParticipantCount,
  sendCityChatMessage,
} from "@services/cityChat/cityChatController";
import { formatTime, getInitials } from "@utils/formatters";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, Text, View } from "react-native";

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
    const isMe = item.senderId === user?.userId;
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
    <>
      <View className="w-12 h-12 rounded-full bg-fdm-accent/20 border border-fdm-accent/30 items-center justify-center mr-3 overflow-hidden">
        <View className="h-8 w-8">
          <CityImage officeLocation={cityLabel} fitContainer />
        </View>
      </View>

      <View className="flex-1">
        <Text className="text-fdm-fg text-base font-semibold" numberOfLines={1}>
          {cityLabel} Group Chat
        </Text>
        <Text className="text-fdm-fg/40 text-xs mt-0.5" numberOfLines={1}>
          {participantCount} {participantCount === 1 ? "person" : "people"} in this group
        </Text>
      </View>
    </>
  );

  return (
    <ChatScreenLayout
      chatId={parsedCityChatId}
      source="CITY"
      headerContent={headerContent}
      flatListRef={flatListRef}
      renderMessage={renderMessage}
      listEmptyText="No messages in this city chat yet"
      inputProps={{
        ...inputProps,
        placeholder: inputProps.attachment ? "Add a caption..." : "Message city group...",
      }}
    />
  );
}
