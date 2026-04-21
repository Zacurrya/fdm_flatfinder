import ComposerActionsModal from "@components/Chat/ComposerActionsModal";
import MessageInputBox from "@components/Chat/MessageInputBox";
import { Ionicons } from "@expo/vector-icons";
import { DecoratedChatMessage, useChatMessages } from "@hooks/useChatMessages";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ReactNode, RefObject, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    ListRenderItem,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Use the props type from MessageInputBox directly
type MessageInputProps = React.ComponentProps<typeof MessageInputBox>;

type ChatScreenLayoutProps = {
    chatId: string | number;
    source: "PRIVATE" | "CITY";
    /* Left-side avatar + title/subtitle block inside the header row */
    headerContent: ReactNode;
    /* Optional card shown beneath the header (e.g. the listing card) */
    subHeader?: ReactNode;
    /* Extra node rendered after the KeyboardAvoidingView (e.g. modals) */
    footerExtra?: ReactNode;
    flatListRef: RefObject<FlatList | null>;
    renderMessage: (item: DecoratedChatMessage, index: number) => ReactNode;
    listEmptyIcon?: ReactNode;
    listEmptyText?: string;
    inputProps: MessageInputProps;
    /* Spacing between messages. */
    messageGap?: number | string;
};

export default function ChatScreenLayout({
    chatId,
    source,
    headerContent,
    subHeader,
    flatListRef,
    renderMessage,
    listEmptyIcon,
    listEmptyText = "Send a message to get started",
    inputProps,
    messageGap = 2.5,
}: ChatScreenLayoutProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [actionsVisible, setActionsVisible] = useState(false);

    const { messages, loading } = useChatMessages(chatId, source);

    const handlePressPlus = () => {
        if (inputProps.onPressPlus) {
            inputProps.onPressPlus();
        }
        setActionsVisible(true);
    };

    const renderItem: ListRenderItem<DecoratedChatMessage> = ({ item, index }) => {
        return (
            <View
                style={{
                    marginBottom:
                        typeof messageGap === "number"
                            ? messageGap * 4
                            : undefined,
                }}
            >
                {renderMessage(item, index)}
            </View>
        );
    };

    const handleContentSizeChange = () => {
        flatListRef.current?.scrollToEnd({ animated: false });
    };

    return (
        <View className="flex-1 bg-fdm-bg">
            <StatusBar style="light" />

            {/* -- Header -- */}
            <View
                className="px-4 border-b border-fdm-fg/10 bg-fdm-bg"
                style={{ paddingTop: insets.top + 8, paddingBottom: 14 }}
            >
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.replace("/(tabs)/messages")}
                        className="w-10 h-10 rounded-full bg-fdm-fg/10 items-center justify-center mr-3"
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>

                    {headerContent}
                </View>
            </View>

            {/* -- Optional subheading for listing chats -- */}
            {subHeader}

            {/* -- Body -- */}
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
                    {/* Messages List */}
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderItem}
                        onContentSizeChange={handleContentSizeChange}
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center">
                                {listEmptyIcon ?? (
                                    <Ionicons
                                        name="chatbubble-outline"
                                        size={40}
                                        color="#ffffff20"
                                    />
                                )}
                                <Text className="text-fdm-fg/30 text-sm mt-4">
                                    {listEmptyText}
                                </Text>
                            </View>
                        }
                    />
                    {/* Input box */}
                    <View
                        className="flex-row items-end px-2 py-2 bg-fdm-bg"
                        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
                    >
                        <MessageInputBox
                            {...inputProps}
                            onPressPlus={handlePressPlus}
                        />
                    </View>
                    <ComposerActionsModal
                        visible={actionsVisible}
                        onClose={() => setActionsVisible(false)}
                        onSelectImage={inputProps.onPressImage}
                    />
                </KeyboardAvoidingView>
            )}
        </View>
    );
}
