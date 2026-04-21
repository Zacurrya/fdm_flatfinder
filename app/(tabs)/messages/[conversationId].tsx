import {
  fetchAndMapConversationMessages,
  mapConversationMessage,
  MappedChatMessage,
} from "@/utils/mapMessages";
import ChatScreenLayout from "@components/Chat/ChatScreenLayout";
import ContactActionButtons from "@components/Chat/ContactActionButtons";
import MessageAvatar from "@components/Chat/MessageAvatar";
import DateMessage from "@components/Chat/MessageTypes/DateMessage";
import MessageBuilder from "@components/Chat/MessageTypes/MessageBuilder";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@lib/supabase";
import {
  getConversationDetails,
  ListingSnippet,
  OtherUserProfile,
  sendMessage,
} from "@services/chat/chatController";
import { uploadListingPhoto } from "@services/listings/listingController";
import { formatCurrencyWithSymbol } from "@utils/currency";
import { formatTime } from "@utils/formatters";
import { subscribeToConversationMessages } from "@utils/realtime";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Image, Text, TouchableOpacity, View } from "react-native";

function getFirstPhotoUrl(photos: string[] | null | undefined): string | null {
  if (!photos || photos.length === 0) return null;
  const valid = photos.map((u) => u.trim()).filter((u) => u.startsWith("http"));
  return valid[0] ?? null;
}

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<MappedChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<{ uri: string; type: "image" } | null>(null);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [otherUser, setOtherUser] = useState<OtherUserProfile | null>(null);
  const [listing, setListing] = useState<ListingSnippet | null>(null);
  const [listingPhotoUrl, setListingPhotoUrl] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Load messages & conversation details
  useEffect(() => {
    if (!conversationId || !user?.userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [messagesResult, detailsResult] = await Promise.all([
          fetchAndMapConversationMessages({ conversationId }),
          getConversationDetails({ conversationId, currentUserId: user.userId }),
        ]);

        if (!messagesResult.success || !messagesResult.data) {
          throw new Error(messagesResult.error ?? "Failed to load messages.");
        }

        if (!detailsResult.success || !detailsResult.data) {
          throw new Error(detailsResult.error ?? "Failed to load conversation details.");
        }

        setMessages(messagesResult.data);
        setOtherUser(detailsResult.data.otherUser);
        setListing(detailsResult.data.listing);
        setListingPhotoUrl(
          detailsResult.data.listing?.photos
            ? getFirstPhotoUrl(detailsResult.data.listing.photos)
            : null
        );
      } catch (error) {
        console.error("Failed to load chat:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [conversationId, user?.userId]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = subscribeToConversationMessages(conversationId, (raw) => {
      const newMessage = raw as Parameters<typeof mapConversationMessage>[0];
      const mappedMessage = mapConversationMessage(newMessage);
      setMessages((prev) => {
        if (prev.find((m) => m.id === mappedMessage.id)) return prev;
        return [...prev, mappedMessage];
      });
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // Send
  const handleSend = async () => {
    const content = inputText.trim();
    if ((!content && !attachment) || !user?.userId || !conversationId || sending) return;

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

      const savedResult = await sendMessage({ conversationId, senderId: user.userId, content: finalContent });

      if (!savedResult.success || !savedResult.data) {
        throw new Error(savedResult.error ?? "Failed to send message.");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputText(content);
    } finally {
      setSending(false);
    }
  };

  const handleUploadImage = async () => {
    if (!user?.userId || !conversationId || uploadingImage) return;

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


  // Helpers

  const getRentLabel = (period: string | null | undefined) => {
    if (period === "WEEKLY") return "pw";
    if (period === "BIWEEKLY") return "biwk";
    return "pcm";
  };

  const otherUserName = otherUser
    ? [otherUser.firstName, otherUser.lastName].filter(Boolean).join(" ") || "User"
    : "Chat";

  const initials = otherUserName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Render helpers
  const renderMessage = ({ item, index }: { item: MappedChatMessage; index: number }) => {
    const isMe = item.senderId === user?.userId;
    const previous = messages[index - 1];
    const showDateSeparator =
      !previous ||
      new Date(item.createdAt).toDateString() !== new Date(previous.createdAt).toDateString();

    return (
      <>
        {showDateSeparator && <DateMessage date={item.createdAt} />}

        <View
          className={`flex-row mb-1 px-4 items-end ${isMe ? "justify-end" : "justify-start"}`}
        >
          {!isMe ? (
            <MessageAvatar profilePicture={otherUser?.profilePicture} initials={initials} />
          ) : null}

          <MessageBuilder
            content={item.content}
            timeLabel={formatTime(item.createdAt)}
            isMe={isMe}
            senderName={otherUserName}
            showSenderName={false}
          />
        </View>
      </>
    );
  };

  // Header avatar + title
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

  // Listing card
  const subHeader = listing ? (
    <TouchableOpacity
      onPress={() => router.push(`/listing/${listing.id}` as any)}
      className="mx-4 mt-3 flex-row bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl overflow-hidden active:opacity-70"
    >
      <View className="w-[72px] h-[72px] bg-fdm-fg/10 items-center justify-center overflow-hidden">
        {listingPhotoUrl ? (
          <Image
            source={{ uri: listingPhotoUrl }}
            style={{ width: 72, height: 72 }}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="home" size={26} color="#ccff0040" />
        )}
      </View>

      <View className="flex-1 px-3 py-2 justify-center">
        <Text className="text-fdm-fg font-semibold text-sm" numberOfLines={1}>
          {listing.title}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="location-outline" size={11} color="#ffffff50" />
          <Text className="text-fdm-fg/50 text-xs flex-1" numberOfLines={1}>
            {listing.location}
          </Text>
        </View>
        <View className="flex-row items-center mt-1 gap-1">
          <Ionicons name="home-outline" size={11} color="#ccff0060" />
          <Text className="text-fdm-accent/70 text-xs">View listing</Text>
        </View>
      </View>

      <View className="px-3 justify-center items-end border-l border-fdm-fg/10">
        <Text className="text-fdm-accent font-bold text-base">
          {formatCurrencyWithSymbol(listing.price)}
        </Text>
        <Text className="text-fdm-fg/40 text-xs">{getRentLabel(listing.rentPeriod)}</Text>
        <Ionicons name="chevron-forward" size={14} color="#ffffff20" style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  ) : undefined;

  return (
    <ChatScreenLayout
      headerContent={headerContent}
      subHeader={subHeader}
      messages={messages}
      loading={loading}
      flatListRef={flatListRef}
      renderMessage={renderMessage}
      listEmptyText="Send a message to get started"
      inputProps={{
        value: inputText,
        onChangeText: setInputText,
        placeholder: attachment ? "Add a caption..." : "Message...",
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
