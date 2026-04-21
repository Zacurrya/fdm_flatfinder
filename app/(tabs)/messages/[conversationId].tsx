import ChatListingSubHeader from "@components/Chat/ChatListingSubHeader";
import ChatScreenLayout from "@components/Chat/ChatScreenLayout";
import ContactActionButtons from "@components/Chat/ContactActionButtons";
import MessageBuilder from "@components/Chat/MessageTypes/MessageBuilder";
import FDMLoader from "@components/ui/FDMLoader";
import { useAuth } from "@context/AuthContext";
import { DecoratedChatMessage } from "@hooks/useChatMessages";
import {
  getConversationDetails,
  OtherUserProfile,
  sendMessage,
} from "@services/chat/chatController";
import { uploadListingPhoto } from "@services/listings/listingController";
import { formatCurrencyWithSymbol } from "@utils/currency";
import { formatTime } from "@utils/formatters";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Image, Text, TouchableOpacity, View } from "react-native";

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<{ uri: string; type: "image" } | null>(null);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [otherUser, setOtherUser] = useState<OtherUserProfile | null>(null);
  const [listingData, setListingData] = useState<any>(null);
  
  const flatListRef = useRef<FlatList>(null);

  // Load conversation details (Other user & Listing metadata)
  useEffect(() => {
    if (!conversationId || !user?.userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const detailsResult = await getConversationDetails({
          conversationId,
          currentUserId: user.userId
        });

        if (!detailsResult.success || !detailsResult.data) {
          throw new Error(detailsResult.error ?? "Failed to load conversation details.");
        }

        setOtherUser(detailsResult.data.otherUser);
        setListingData(detailsResult.data.listing);
      } catch (error) {
        console.error("Failed to load conversation details:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [conversationId, user?.userId]);

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
  if (loading) {
    return <FDMLoader />;
  }

  return (
    <ChatScreenLayout
      chatId={conversationId}
      source="PRIVATE"
      headerContent={headerContent}
      subHeader={<ChatListingSubHeader initialData={listingData} />}
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
