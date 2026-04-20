import AwaitingApprovalView from "@components/ui/AwaitingApprovalView";
import CityImage from "@components/ui/CityImage";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { ConversationWithUser, getConversations } from "@services/chat/chatController";
import { CityChat, fetchCityChats, getOrCreateCityChatByCity } from "@services/cityChat/cityChatController";
import { formatCurrencyWithSymbol } from "@utils/currency";
import { formatRelativeDate, getInitials } from "@utils/formatters";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MessagesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [cityChats, setCityChats] = useState<CityChat[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user?.userId) return;
      let active = true;

      const load = async () => {
        setLoading(true);
        try {
          const conversationsResult = await getConversations({ userId: user.userId });

          if (!conversationsResult.success || !conversationsResult.data) {
            throw new Error(conversationsResult.error ?? "Failed to load conversations.");
          }

          const cityChatsResult =
            user.role === "ADMIN"
              ? await fetchCityChats()
              : user.officeLocation?.trim()
                ? await getOrCreateCityChatByCity({ city: user.officeLocation })
                : { success: true, data: null };

          if (active) {
            setConversations(conversationsResult.data);
            if (!cityChatsResult.success) {
              setCityChats([]);
            } else if (Array.isArray(cityChatsResult.data)) {
              setCityChats(cityChatsResult.data);
            } else if (cityChatsResult.data) {
              setCityChats([cityChatsResult.data]);
            } else {
              setCityChats([]);
            }
          }
        } catch (e) {
          console.error("Failed to load conversations:", e);
        } finally {
          if (active) setLoading(false);
        }
      };

      load();
      return () => {
        active = false;
      };
    }, [user?.userId, user?.officeLocation, user?.role])
  );

  if (user?.approvalStatus === "PENDING" || user?.approvalStatus === "REJECTED") {
    return (
      <AwaitingApprovalView
        title={user.approvalStatus === "REJECTED" ? "Account Denied" : "Awaiting Admin Approval"}
        message={
          user.approvalStatus === "REJECTED"
            ? "Your account has been denied. Please contact an administrator for more information."
            : "Your account is awaiting admin approval."
        }
      />
    );
  }

  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" />

      <View className="pt-14 pb-4 px-6">
        <Text className="text-fdm-fg text-3xl font-bold tracking-tight">Messages</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ccff00" />
        </View>
      ) : conversations.length === 0 && cityChats.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="chatbubbles-outline" size={56} color="#ffffff20" />
          <Text className="text-fdm-fg/40 text-base text-center mt-4">No messages yet.</Text>
          <Text className="text-fdm-fg/30 text-sm text-center mt-1">
            Open a listing and tap Message Seller to start a conversation.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {cityChats.map((cityChat) => (
            <TouchableOpacity
              key={`city-chat-${cityChat.id}`}
              onPress={() =>
                router.push(
                  `/(tabs)/messages/city/${cityChat.id}?city=${encodeURIComponent(cityChat.city)}` as any
                )
              }
              className="flex-row items-center px-6 py-4 border-b border-fdm-fg/5 active:bg-fdm-fg/5"
            >
              <View className="w-12 h-12 rounded-full bg-fdm-accent/20 border border-fdm-accent/30 items-center justify-center overflow-hidden">
                <View className="h-8 w-8">
                  <CityImage officeLocation={cityChat.city} fitContainer />
                </View>
              </View>

              <View className="flex-1 ml-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-fdm-fg font-semibold text-base" numberOfLines={1}>
                    {cityChat.city} Group Chat
                  </Text>
                  {cityChat.last_message_at ? (
                    <Text className="text-fdm-fg/40 text-xs">{formatRelativeDate(cityChat.last_message_at)}</Text>
                  ) : null}
                </View>

                <Text className="text-fdm-fg/50 text-sm mt-0.5" numberOfLines={1}>
                  {cityChat.last_message ?? "Start chatting with your city group"}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={16}
                color="#ffffff30"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          ))}

          {conversations.map((conv) => {
            const name =
              [conv.otherUser.firstName, conv.otherUser.lastName]
                .filter(Boolean)
                .join(" ") || "User";
            const initials = getInitials(name);

            return (
              <TouchableOpacity
                key={conv.id}
                onPress={() => router.push(`/(tabs)/messages/${conv.id}` as any)}
                className="flex-row items-center px-6 py-4 border-b border-fdm-fg/5 active:bg-fdm-fg/5"
              >
                {conv.otherUser.profilePicture ? (
                  <Image
                    source={{ uri: conv.otherUser.profilePicture }}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-fdm-accent/20 border border-fdm-accent/30 items-center justify-center">
                    <Text className="text-fdm-accent font-bold text-base">{initials}</Text>
                  </View>
                )}

                <View className="flex-1 ml-4">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-fdm-fg font-semibold text-base">{name}</Text>
                    <Text className="text-fdm-fg/40 text-xs">{formatRelativeDate(conv.last_message_at)}</Text>
                  </View>

                  <Text className="text-fdm-fg/50 text-sm mt-0.5" numberOfLines={1}>
                    {conv.last_message ?? "Start a conversation"}
                  </Text>

                  {conv.listing && (
                    <View className="flex-row items-center mt-1.5 gap-1">
                      <Ionicons name="home-outline" size={11} color="#ccff0070" />
                      <Text className="text-fdm-accent/70 text-xs flex-1" numberOfLines={1}>
                        {conv.listing.title} - {formatCurrencyWithSymbol(conv.listing.price)}/
                        {conv.listing.rentPeriod === "WEEKLY"
                          ? "pw"
                          : conv.listing.rentPeriod === "BIWEEKLY"
                            ? "biwk"
                            : "pcm"}
                      </Text>
                    </View>
                  )}
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#ffffff30"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
