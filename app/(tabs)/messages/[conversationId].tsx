import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";
import {
    getConversationDetails,
    getMessages,
    ListingSnippet,
    Message,
    OtherUserProfile,
    sendMessage,
    subscribeToMessages,
} from "../../../services/chat/chatService";

function getFirstPhotoUrl(photos: string[] | null | undefined): string | null {
  if (!photos || photos.length === 0) return null;
  const valid = photos.map((u) => u.trim()).filter((u) => u.startsWith("http"));
  return valid[0] ?? null;
}

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<OtherUserProfile | null>(null);
  const [listing, setListing] = useState<ListingSnippet | null>(null);
  const [listingPhotoUrl, setListingPhotoUrl] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!conversationId || !user?.userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [msgs, details] = await Promise.all([
          getMessages(conversationId),
          getConversationDetails(conversationId, user.userId),
        ]);

        setMessages(msgs);
        setOtherUser(details.otherUser);
        setListing(details.listing);

        if (details.listing?.photos) {
          const raw = getFirstPhotoUrl(details.listing.photos);
          if (raw) {
            setListingPhotoUrl(raw);
          }
        }
      } catch (e) {
        console.error("Failed to load chat:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [conversationId, user?.userId]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = subscribeToMessages(conversationId, (newMessage) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSend = async () => {
    const content = inputText.trim();
    if (!content || !user?.userId || !conversationId || sending) return;

    setInputText("");
    setSending(true);

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: user.userId,
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    flatListRef.current?.scrollToEnd({ animated: true });

    try {
      const saved = await sendMessage(conversationId, user.userId, content);
      setMessages((prev) => prev.map((m) => (m.id === tempMessage.id ? saved : m)));
    } catch (e) {
      console.error("Failed to send message:", e);
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      setInputText(content);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.sender_id === user?.userId;
    const previous = messages[index - 1];
    const showDateSeparator =
      !previous ||
      new Date(item.created_at).toDateString() !== new Date(previous.created_at).toDateString();

    return (
      <>
        {showDateSeparator && (
          <View className="items-center my-3">
            <Text className="text-fdm-fg/30 text-xs bg-fdm-fg/5 px-3 py-1 rounded-full">
              {new Date(item.created_at).toLocaleDateString([], {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </Text>
          </View>
        )}

        <View
          className={`flex-row mb-1 px-4 items-end ${
            isMe ? "justify-end" : "justify-start"
          }`}
        >
          {!isMe && (
            <View className="w-7 h-7 rounded-full bg-fdm-accent/20 border border-fdm-accent/30 items-center justify-center mr-2 mb-1 overflow-hidden">
              {otherUser?.profilePicture ? (
                <Image source={{ uri: otherUser.profilePicture }} style={{ width: 28, height: 28 }} />
              ) : (
                <Text className="text-fdm-accent font-bold text-xs">{initials}</Text>
              )}
            </View>
          )}

          <View
            className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
              isMe
                ? "bg-fdm-accent rounded-tr-sm"
                : "bg-fdm-fg/10 border border-fdm-fg/10 rounded-tl-sm"
            }`}
          >
            <Text className={isMe ? "text-fdm-bg font-medium" : "text-fdm-fg"}>{item.content}</Text>
            <Text className={`text-xs mt-1 ${isMe ? "text-fdm-bg/60 text-right" : "text-fdm-fg/40"}`}>
              {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" />

      <View
        className="px-4 border-b border-fdm-fg/10 bg-fdm-bg"
        style={{ paddingTop: insets.top + 8, paddingBottom: 14 }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-fdm-fg/10 items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

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

          <View className="flex-row gap-2">
            {otherUser?.phoneNumber && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${otherUser.phoneNumber}`)}
                className="w-9 h-9 rounded-full bg-fdm-accent/10 border border-fdm-accent/20 items-center justify-center"
              >
                <Ionicons name="call-outline" size={16} color="#ccff00" />
              </TouchableOpacity>
            )}
            {otherUser?.email && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`mailto:${otherUser.email}`)}
                className="w-9 h-9 rounded-full bg-fdm-accent/10 border border-fdm-accent/20 items-center justify-center"
              >
                <Ionicons name="mail-outline" size={16} color="#ccff00" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {listing && (
        <TouchableOpacity
          onPress={() => router.push(`/listing/${listing.id}` as any)}
          className="mx-4 mt-3 flex-row bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl overflow-hidden active:opacity-70"
        >
          <View className="w-[72px] h-[72px] bg-fdm-fg/10 items-center justify-center overflow-hidden">
            {listingPhotoUrl ? (
              <Image source={{ uri: listingPhotoUrl }} style={{ width: 72, height: 72 }} resizeMode="cover" />
            ) : (
              <Ionicons name="home" size={26} color="#ccff0040" />
            )}
          </View>

          <View className="flex-1 px-3 py-2 justify-center">
            <Text className="text-fdm-fg font-semibold text-sm" numberOfLines={1}>
              {listing.title}
            </Text>
            <View className="flex-row items-center mt-1 gap-1">
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
            <Text className="text-fdm-accent font-bold text-base">GBP {listing.price}</Text>
            <Text className="text-fdm-fg/40 text-xs">{getRentLabel(listing.rentPeriod)}</Text>
            <Ionicons name="chevron-forward" size={14} color="#ffffff20" style={{ marginTop: 4 }} />
          </View>
        </TouchableOpacity>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ccff00" />
        </View>
      ) : (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ paddingVertical: 12, flexGrow: 1 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <Ionicons name="chatbubble-outline" size={40} color="#ffffff20" />
                <Text className="text-fdm-fg/30 text-sm mt-3">Send a message to get started</Text>
              </View>
            }
          />

          <View
            className="flex-row items-end px-4 py-3 border-t border-fdm-fg/10 bg-fdm-bg"
            style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message..."
              placeholderTextColor="#ffffff40"
              multiline
              maxLength={1000}
              className="flex-1 bg-fdm-fg/10 text-fdm-fg border border-fdm-fg/10 rounded-2xl px-4 py-3 mr-3 text-base"
              style={{ maxHeight: 120 }}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
              className={`w-11 h-11 rounded-full items-center justify-center ${
                inputText.trim() ? "bg-fdm-accent" : "bg-fdm-fg/10"
              }`}
            >
              <Ionicons
                name="send"
                size={18}
                color={inputText.trim() ? "#1a1a1a" : "#ffffff30"}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
