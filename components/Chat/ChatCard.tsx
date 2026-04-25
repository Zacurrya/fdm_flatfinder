import ProfilePic from "@components/profile/ProfilePic";
import { Ionicons } from "@expo/vector-icons";
import { ChatPreview } from "@services/chat/types";
import { formatRelativeDate } from "@utils/formatters";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type ChatCardProps = {
  chat: ChatPreview;
};

export const ChatCard = ({ chat }: ChatCardProps) => {
  const router = useRouter();

  const displayName = chat.displayName || "User";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/messages/${chat.id}` as any)}
      className="flex-row items-center px-6 py-4 border-b border-fdm-fg/5 active:bg-fdm-fg/5"
    >
      <ProfilePic
        avatarUrl={chat.displayPicture as string}
        size={48}
      />

      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-center">
          <Text
            className="text-fdm-fg font-semibold text-base"
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {chat.lastMessageAt ? (
            <Text className="text-fdm-fg/40 text-xs">
              {formatRelativeDate(chat.lastMessageAt)}
            </Text>
          ) : null}
        </View>

        <Text className="text-fdm-fg/50 text-sm mt-0.5" numberOfLines={1}>
          {chat.lastMessage || "Start a conversation"}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={16}
        color="#ffffff30"
        style={{ marginLeft: 8 }}
      />
    </TouchableOpacity>
  );
};
