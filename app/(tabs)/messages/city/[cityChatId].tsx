import CityImage from "@/components/ui/CityImage";
import {
  fetchAndMapCityChatMessages,
  mapCityChatMessage,
  MappedChatMessage,
} from "@/utils/mapMessages";
import ChatScreenLayout from "@components/Chat/ChatScreenLayout";
import ComposerActionsModal from "@components/Chat/ComposerActionsModal";
import MessageAvatar from "@components/Chat/MessageAvatar";
import MessageBuilder from "@/components/MessageTypes/MessageBuilder";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@lib/supabase";
import {
  getCityChatParticipantCount,
  getCityChatSenderProfile,
  sendCityChatMessage,
  subscribeToCityChatMessages,
} from "@services/cityChat/cityChatController";
import { uploadListingPhoto } from "@services/listings/listingController";
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
  const [isComposerModalVisible, setIsComposerModalVisible] = useState(false);
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

  // ── Real-time subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!isValidId) return;

    const subscriptionResult = subscribeToCityChatMessages({
      cityChatId: parsedCityChatId,
      onNewMessage: (newMessage) => {
        setMessages((prev) => {
          const mappedMessage = mapCityChatMessage(newMessage);
          if (prev.find((m) => m.id === mappedMessage.id)) return prev;
          return [...prev, mappedMessage];
        });
        flatListRef.current?.scrollToEnd({ animated: true });

        if (newMessage.senderId !== user?.userId) {
          void getCityChatSenderProfile({ senderId: newMessage.senderId }).then((profileResult) => {
            if (!profileResult.success) return;

            setMessages((prev) =>
              prev.map((message) =>
                message.id === String(newMessage.id)
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
      },
    });

    if (!subscriptionResult.success || !subscriptionResult.data) {
      console.error("Failed to subscribe to city chat:", subscriptionResult.error);
      return;
    }

    const channel = subscriptionResult.data;
    return () => { supabase.removeChannel(channel); };
  }, [isValidId, parsedCityChatId, user?.userId]);

  // ── Send text ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const content = inputText.trim();
    if ((!content && !attachment) || !user?.userId || !isValidId || sending) return;

    setInputText("");
    setAttachment(null);
    setSending(true);

    // Optimistic UI for local rendering
    const tempId = `temp-${Date.now()}`;
    const tempMessageContent = attachment ? (content ? `${attachment.uri} ${content}` : attachment.uri) : content;

    const tempMessage: MappedChatMessage = {
      id: tempId,
      content: tempMessageContent,
      createdAt: new Date().toISOString(),
      senderId: user.userId,
    };

    setMessages((prev) => [...prev, tempMessage]);
    flatListRef.current?.scrollToEnd({ animated: true });

    try {
      let finalContent = content;

      // Handle image upload if attached
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

      const mappedSavedMessage = mapCityChatMessage(result.data);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? mappedSavedMessage : m)));
    } catch (error) {
      console.error("Failed to send city chat message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputText(content);
      // We don't restore the attachment for simplicity, as it's usually safer
    } finally {
      setSending(false);
    }
  };

  // ── Upload & send image ───────────────────────────────────────────────────
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

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ── Render message ────────────────────────────────────────────────────────
  const renderMessage = ({ item, index }: { item: MappedChatMessage; index: number }) => {
    const isMe = item.senderId === user?.userId;
    const previous = messages[index - 1];
    const isPreviousFromSameSender = previous?.senderId === item.senderId;
    const showSenderMeta = !isMe && !isPreviousFromSameSender;
    const showDateSeparator =
      !previous ||
      new Date(item.createdAt).toDateString() !== new Date(previous.createdAt).toDateString();

    const senderName = item.senderName || "Consultant";
    const senderInitials = senderName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <>
        {showDateSeparator && (
          <View className="items-center my-3">
            <Text className="text-fdm-fg/30 text-xs bg-fdm-fg/5 px-3 py-1 rounded-full">
              {new Date(item.createdAt).toLocaleDateString([], {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </Text>
          </View>
        )}

        <View className={`flex-row px-4 items-start ${isMe ? "justify-end" : "justify-start"}`}>
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

  // ── Slot: header avatar + title ───────────────────────────────────────────
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
        onPressPlus: () => setIsComposerModalVisible(true),
        onPressImage: handleUploadImage,
        actionsDisabled: uploadingImage || sending,
        attachment: attachment,
        onClearAttachment: () => setAttachment(null),
      }}
      footerExtra={
        <ComposerActionsModal
          visible={isComposerModalVisible}
          onClose={() => setIsComposerModalVisible(false)}
        />
      }
    />
  );
}
