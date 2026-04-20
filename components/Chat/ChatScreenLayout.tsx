import MessageInputBox from "@components/Chat/MessageInputBox";
import { Ionicons } from "@expo/vector-icons";
import { MappedChatMessage } from "@utils/mapMessages";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ReactNode, RefObject } from "react";
import { ListRenderItem } from "react-native";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MessageInputProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onSend: () => void;
    sendDisabled: boolean;
    editable?: boolean;
    showActions?: boolean;
    onPressPlus?: () => void;
    onPressImage?: () => void;
    actionsDisabled?: boolean;
    attachment?: { uri: string; type: "image" } | null;
    onClearAttachment?: () => void;
};

type ChatScreenLayoutProps = {
    /** Left-side avatar + title/subtitle block inside the header row */
    headerContent: ReactNode;
    /** Optional card shown beneath the header (e.g. the listing card) */
    subHeader?: ReactNode;
    /** extra node rendered after the KeyboardAvoidingView (e.g. modals) */
    footerExtra?: ReactNode;
    messages: MappedChatMessage[];
    loading: boolean;
    flatListRef: RefObject<FlatList | null>;
    renderMessage: ListRenderItem<MappedChatMessage>;
    listEmptyIcon?: ReactNode;
    listEmptyText?: string;
    inputProps: MessageInputProps;
    /** spacing between messages (Tailwind scale, e.g. 2 for mb-2). Defaults to 2.5. */
    messageGap?: number | string;
};

export default function ChatScreenLayout({
    headerContent,
    subHeader,
    footerExtra,
    messages,
    loading,
    flatListRef,
    renderMessage,
    listEmptyIcon,
    listEmptyText = "Send a message to get started",
    inputProps,
    messageGap = 2.5,
}: ChatScreenLayoutProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

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
                        renderItem={(info) => (
                            <View style={{ marginBottom: typeof messageGap === 'number' ? messageGap * 4 : undefined }}>
                                {renderMessage(info)}
                            </View>
                        )}
                        onContentSizeChange={() =>
                            flatListRef.current?.scrollToEnd({ animated: false })
                        }
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

                    <View
                        className="flex-row items-end px-2 py-2 bg-fdm-bg"
                        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
                    >
                        <MessageInputBox {...inputProps} />
                    </View>
                </KeyboardAvoidingView>
            )}

            {/* -- Optional footer extras (e.g. modals) -- */}
            {footerExtra}
        </View>
    );
}
