import ProfilePic from "@components/profile/ProfilePic";
import { Ionicons } from "@expo/vector-icons";
import { ChatPreview as ChatPreviewType } from "@services/chat/types";
import { formatRelativeDate } from "@utils/formatters";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type ChatPreviewProps = {
  chat: ChatPreviewType;
};

/**
 * Displaying a chat preview in the messages list.
 * Shows the participant's avatar, name, and the latest message or enquiry metadata.
 */
const ChatPreview = ({ chat }: ChatPreviewProps) => {
  const router = useRouter();

  const displayName = chat.displayName || "User";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/messages/${chat.id}` as any)}
      className="flex-row items-center px-6 py-5 border-b border-fdm-fg/5 active:bg-fdm-fg/5"
    >
      <ProfilePic
        avatarUrl={chat.displayPicture as string}
        size={68}
      />

      <View className="flex-1 ml-5">
        <Text
          className="text-fdm-fg font-semibold text-lg"
          numberOfLines={1}
        >
          {displayName}
        </Text>

        <View className="flex-row justify-between items-center mt-0.5">
          <Text className="text-fdm-fg/50 text-base flex-1 mr-2" numberOfLines={1}>
            {chat.listingId ? (
              <Text className="text-fdm-accent/80 font-medium italic">Enquiry: {chat.listingTitle || "Unknown listing"}</Text>
            ) : (
              chat.lastMessage || "Start a conversation"
            )}
          </Text>
          {chat.lastMessageAt ? (
            <Text className="text-fdm-fg/30 text-xs">
              {formatRelativeDate(chat.lastMessageAt)}
            </Text>
          ) : null}
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#ffffff30"
        style={{ marginLeft: 8 }}
      />
    </TouchableOpacity>
  );
};

export default ChatPreview;
