import CityImage from "@/components/ui/CityImage";
import {
  fetchAndMapCityChatMessages,
  mapCityChatMessage,
  MappedChatMessage,
} from "@/utils/mapMessages";
import ChatScreenLayout from "@components/Chat/ChatScreenLayout";
import ComposerActionsModal from "@components/Chat/ComposerActionsModal";
import MessageAvatar from "@components/Chat/MessageAvatar";
import MessageBubble from "@components/Chat/MessageBubble";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@lib/supabase";
import {
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
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isComposerModalVisible, setIsComposerModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const isValidId = Number.isFinite(parsedCityChatId) && parsedCityChatId > 0;

  // ── Load messages ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isValidId) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const result = await fetchAndMapCityChatMessages({ cityChatId: parsedCityChatId });
        if (!result.success || !result.data) {
          throw new Error(result.error ?? "Failed to load city chat messages.");
        }
        setMessages(result.data);
      } catch (error) {
        console.error("Failed to load city chat messages:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadMessages();
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
    if (!content || !user?.userId || !isValidId || sending) return;

    setInputText("");
    setSending(true);

    const tempMessage: MappedChatMessage = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      senderId: user.userId,
    };

    setMessages((prev) => [...prev, tempMessage]);
    flatListRef.current?.scrollToEnd({ animated: true });

    try {
      const result = await sendCityChatMessage({
        cityChatId: parsedCityChatId,
        senderId: user.userId,
        content,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error ?? "Failed to send city chat message.");
      }

      const mappedSavedMessage = mapCityChatMessage(result.data);
      setMessages((prev) => prev.map((m) => (m.id === tempMessage.id ? mappedSavedMessage : m)));
    } catch (error) {
      console.error("Failed to send city chat message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      setInputText(content);
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

      setUploadingImage(true);

      const imageUri = pickerResult.assets[0].uri;
      const uploadedUrl = await uploadListingPhoto({ uri: imageUri });

      const tempMessage: MappedChatMessage = {
        id: `temp-${Date.now()}`,
        senderId: user.userId,
        content: uploadedUrl,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]);
      flatListRef.current?.scrollToEnd({ animated: true });

      const result = await sendCityChatMessage({
        cityChatId: parsedCityChatId,
        senderId: user.userId,
        content: uploadedUrl,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error ?? "Failed to send image.");
      }

      const mappedSavedMessage = mapCityChatMessage(result.data);
      setMessages((prev) => prev.map((m) => (m.id === tempMessage.id ? mappedSavedMessage : m)));
    } catch (error) {
      console.error("Failed to upload/send image:", error);
      Alert.alert("Upload Failed", "We couldn't upload your image right now.");
    } finally {
      setUploadingImage(false);
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

        <View className={`flex-row mb-1 px-4 items-end ${isMe ? "justify-end" : "justify-start"}`}>
          {!isMe ? (
            <MessageAvatar
              profilePicture={item.senderProfilePicture}
              initials={senderInitials}
              visible={showSenderMeta}
            />
          ) : null}

          <MessageBubble
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
          {messages.length} {messages.length === 1 ? "message" : "messages"}
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
      composerProps={{
        value: inputText,
        onChangeText: setInputText,
        placeholder: "Message city group...",
        editable: !uploadingImage,
        onSend: handleSend,
        sendDisabled: !inputText.trim() || sending || uploadingImage,
        showActions: true,
        onPressPlus: () => setIsComposerModalVisible(true),
        onPressImage: handleUploadImage,
        actionsDisabled: uploadingImage || sending,
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
