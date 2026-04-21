import ChatScreenLayout from "@components/Chat/ChatScreenLayout";
import MessageAvatar from "@components/Chat/MessageAvatar";
import DateMessage from "@components/Chat/MessageTypes/DateMessage";
import MessageBuilder from "@components/Chat/MessageTypes/MessageBuilder";
import CityImage from "@components/ui/CityImage";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@lib/supabase";
import {
  getCityChatParticipantCount,
  getCityChatSenderProfile,
  sendCityChatMessage,
} from "@services/cityChat/cityChatController";
import { uploadListingPhoto } from "@services/listings/listingController";
import { formatTime, getInitials } from "@utils/formatters";
import {
  fetchAndMapCityChatMessages,
  mapCityChatMessage,
  MappedChatMessage,
} from "@utils/mapMessages";
import { subscribeToCityChatMessages } from "@utils/realtime";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";

export default function CityChatScreen() {
  const { cityChatId, city } = useLocalSearchParams<{ cityChatId: string; city?: string }>();
  const { user } = useAuth();

  const parsedCityChatId = Number(cityChatId);
  const cityLabel = typeof city === "string" && city.trim() ? decodeURIComponent(city) : "City";

  const [messages, setMessages] = useState<MappedChatMessage[]>([]);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<{ uri: string; type: "image" } | null>(null);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const isValidId = Number.isFinite(parsedCityChatId) && parsedCityChatId > 0;

  // ── Load messages ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isValidId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [msgResult, countResult] = await Promise.all([
          fetchAndMapCityChatMessages({ cityChatId: parsedCityChatId }),
          getCityChatParticipantCount({ cityChatId: parsedCityChatId }),
        ]);

        if (!msgResult.success || !msgResult.data) {
          throw new Error(msgResult.error ?? "Failed to load city chat messages.");
        }

        setMessages(msgResult.data);
        if (countResult.success && countResult.data !== undefined) {
          setParticipantCount(countResult.data);
        }
      } catch (error) {
        console.error("Failed to load city chat messages:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [isValidId, parsedCityChatId, user?.userId]);

  // Real-time subscription
  useEffect(() => {
    if (!isValidId) return;

    const channel = subscribeToCityChatMessages(parsedCityChatId, (raw) => {
      const newMessage = raw as Parameters<typeof mapCityChatMessage>[0];
      const mappedMessage = mapCityChatMessage(newMessage);
      setMessages((prev) => {
        if (prev.find((m) => m.id === mappedMessage.id)) return prev;
        return [...prev, mappedMessage];
      });
      flatListRef.current?.scrollToEnd({ animated: true });

      if (mappedMessage.senderId !== user?.userId) {
        void getCityChatSenderProfile({ senderId: mappedMessage.senderId }).then((profileResult) => {
          if (!profileResult.success) return;

          setMessages((prev) =>
            prev.map((message) =>
              message.id === mappedMessage.id
                ? {
                  ...message,
                  senderName: profileResult.data
                    ? [profileResult.data.firstName, profileResult.data.lastName]
                      .filter(Boolean)
                      .join(" ") || "Consultant"
                    : message.senderName,
                  senderProfilePicture: profileResult.data?.profilePicture ?? null,
                }
                : message
            )
          );
        });
      }
    });

    return () => { supabase.removeChannel(channel); };
  }, [isValidId, parsedCityChatId, user?.userId]);


  // Send text
  const handleSend = async () => {
    const content = inputText.trim();
    if ((!content && !attachment) || !user?.userId || !isValidId || sending) return;

    setInputText("");
    setAttachment(null);
    setSending(true);

    try {
      let finalContent = content;

      if (attachment) {
        setUploadingImage(true);
        try {
          const uploadedUrl = await uploadListingPhoto({ uri: attachment.uri });
          finalContent = content ? `${uploadedUrl} ${content}` : uploadedUrl;
        } finally {
          setUploadingImage(false);
        }
      }

      const result = await sendCityChatMessage({
        cityChatId: parsedCityChatId,
        senderId: user.userId,
        content: finalContent,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error ?? "Failed to send city chat message.");
      }
    } catch (error) {
      console.error("Failed to send city chat message:", error);
      setInputText(content);
    } finally {
      setSending(false);
    }
  };

  // Upload & send image
  const handleUploadImage = async () => {
    if (!user?.userId || !isValidId || uploadingImage) return;

    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (pickerResult.canceled || pickerResult.assets.length === 0) return;

      const imageUri = pickerResult.assets[0].uri;
      setAttachment({ uri: imageUri, type: "image" });
    } catch (error) {
      console.error("Failed to select image:", error);
      Alert.alert("Selection Failed", "We couldn't select your image.");
    }
  };

  // Render message 
  const renderMessage = ({ item, index }: { item: MappedChatMessage; index: number }) => {
    const isMe = item.senderId === user?.userId;
    const previous = messages[index - 1];
    const isPreviousFromSameSender = previous?.senderId === item.senderId;
    const showSenderMeta = !isMe && !isPreviousFromSameSender;
    const showDateSeparator =
      !previous ||
      new Date(item.createdAt).toDateString() !== new Date(previous.createdAt).toDateString();

    const senderName = item.senderName || "Consultant";
    const senderInitials = getInitials(senderName);

    return (
      <>
        {showDateSeparator && <DateMessage date={item.createdAt} />}

        <View className={`flex-row mb-1 px-4 items-start ${isMe ? "justify-end" : "justify-start"}`}>
          {!isMe ? (
            <MessageAvatar
              profilePicture={item.senderProfilePicture}
              initials={senderInitials}
              visible={showSenderMeta}
            />
          ) : null}

          <MessageBuilder
            content={item.content}
            timeLabel={formatTime(item.createdAt)}
            isMe={isMe}
            senderName={senderName}
            showSenderName={showSenderMeta}
          />
        </View>
      </>
    );
  };

  // Header avatar + title
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
      headerContent={headerContent}
      messages={messages}
      loading={loading}
      flatListRef={flatListRef}
      renderMessage={renderMessage}
      listEmptyIcon={<Ionicons name="people-outline" size={40} color="#ffffff20" />}
      listEmptyText="No messages in this city chat yet"
      inputProps={{
        value: inputText,
        onChangeText: setInputText,
        placeholder: attachment ? "Add a caption..." : "Message city group...",
        editable: !uploadingImage,
        onSend: handleSend,
        sendDisabled: (!inputText.trim() && !attachment) || sending || uploadingImage,
        showActions: true,
        onPressImage: handleUploadImage,
        actionsDisabled: uploadingImage || sending,
        attachment: attachment,
        onClearAttachment: () => setAttachment(null),
      }}
    />
  );
}
