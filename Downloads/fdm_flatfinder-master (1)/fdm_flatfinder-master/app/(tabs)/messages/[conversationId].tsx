import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getMessages,
  sendMessage,
  subscribeToMessages,
  Message,
} from "../../../services/chat/chatService";
import { supabase } from "../../../lib/supabase";

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [otherUserName, setOtherUserName] = useState("Chat");
  const flatListRef = useRef<FlatList>(null);

  // load messages and get the other user's name
  useEffect(() => {
    if (!conversationId || !user?.userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const msgs = await getMessages(conversationId);
        setMessages(msgs);

        // fetch conversation to find other user
        const { data: conv } = await supabase
          .from("Conversations")
          .select("user1_id, user2_id")
          .eq("id", conversationId)
          .single();

        if (conv) {
          const otherId = conv.user1_id === user.userId ? conv.user2_id : conv.user1_id;
          const { data: otherUser } = await supabase
            .from("Users")
            .select("firstName, lastName")
            .eq("userId", otherId)
            .single();

          if (otherUser) {
            setOtherUserName(
              [otherUser.firstName, otherUser.lastName].filter(Boolean).join(" ") || "User"
            );
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

  // subscribe to realtime new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = subscribeToMessages(conversationId, (newMsg) => {
      setMessages((prev) => {
        // avoid duplicates (the sender already added it optimistically)
        if (prev.find((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !user?.userId || !conversationId || sending) return;

    setInputText("");
    setSending(true);

    // optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: user.userId,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    flatListRef.current?.scrollToEnd({ animated: true });

    try {
      const saved = await sendMessage(conversationId, user.userId, text);
      // replace temp with real
      setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? saved : m)));
    } catch (e) {
      console.error("Failed to send message:", e);
      // remove failed optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.sender_id === user?.userId;
    const prevMsg = messages[index - 1];
    const showDateSeparator =
      !prevMsg ||
      new Date(item.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();

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
        <View className={`flex-row mb-1 px-4 ${isMe ? "justify-end" : "justify-start"}`}>
          <View
            className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
              isMe
                ? "bg-fdm-accent rounded-tr-sm"
                : "bg-fdm-fg/10 border border-fdm-fg/10 rounded-tl-sm"
            }`}
          >
            <Text className={isMe ? "text-fdm-bg font-medium" : "text-fdm-fg"}>
              {item.content}
            </Text>
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

      {/* header */}
      <View
        className="flex-row items-center px-4 border-b border-fdm-fg/10 bg-fdm-bg"
        style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-fdm-fg/10 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <View className="w-9 h-9 rounded-full bg-fdm-accent/20 border border-fdm-accent/30 items-center justify-center mr-3">
          <Text className="text-fdm-accent font-bold text-sm">
            {otherUserName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </Text>
        </View>
        <Text className="text-fdm-fg text-lg font-semibold flex-1" numberOfLines={1}>
          {otherUserName}
        </Text>
      </View>

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

          {/* input bar */}
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
