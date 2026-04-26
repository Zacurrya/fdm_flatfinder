import ApprovalGuard from "@components/auth/ApprovalGuard";
import ChatPreviewItem from "@components/Chat/ChatPreview";
import AppTrademark from "@components/ui/AppTrademark";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import FDMLoader from "@components/ui/FDMLoader";
import ScreenHeader from "@components/ui/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import { useChats } from "@hooks/chat/useChats";
import { ChatPreview } from "@services/chat/types";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";

const MessagesScreen = () => {
  const { chats, isLoading } = useChats();

  return (
    <ApprovalGuard>
      <View className="flex-1 bg-fdm-bg">
        <StatusBar style="light" />
        <BackgroundCircle y={0} x="80%" color="#CCFF001A" opacity={0.5} />
        <BackgroundCircle y="90%" x="90%" size={400} color="#CCFF00" opacity={0.07} />
        <BackgroundCircle y={300} x={-200} size={500} color="#CCFF00" opacity={0.04} />

        <ScreenHeader title="Messages" />

        {isLoading ? (
          <FDMLoader />
        ) : chats.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="chatbubbles-outline" size={56} color="#ffffff20" />
            <Text className="text-fdm-fg/40 text-base text-center mt-4">No messages yet.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {chats.map((chat: ChatPreview) => (
              <ChatPreviewItem key={chat.id} chat={chat} />
            ))}
            <AppTrademark />
          </ScrollView>
        )}
      </View>
    </ApprovalGuard>
  );
};

export default MessagesScreen;
