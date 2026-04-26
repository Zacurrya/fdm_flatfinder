import FDMLoader from "@components/ui/FDMLoader";
import { Ionicons } from "@expo/vector-icons";
import { useChats } from "@hooks/chat/useChats";
import React from "react";
import { FlatList, Text, View } from "react-native";
import ChatPreview from "./ChatPreview";

const ChatList = () => {
  const { chats, isLoading, error } = useChats();

  if (isLoading) {
    return <FDMLoader />;
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-red-500 text-center">{error}</Text>
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Ionicons name="chatbubbles-outline" size={48} color="#ffffff20" />
        <Text className="text-fdm-fg/40 mt-4 text-center">No messages yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ChatPreview chat={item} />}
    />
  );
};

export default ChatList;
