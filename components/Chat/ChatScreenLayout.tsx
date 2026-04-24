import { MessageRecord } from "@/types/records";
import ComposerActionsModal from "@components/Chat/ComposerActionsModal";
import MessageInputBox from "@components/Chat/MessageInputBox";
import FDMLoader from "@components/ui/FDMLoader";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ReactNode, RefObject, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    ListRenderItem,
    Platform,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Use the props type from MessageInputBox directly
type MessageInputProps = React.ComponentProps<typeof MessageInputBox> & {
    onPressImage?: () => void;
};

type ChatScreenLayoutProps = {
    chatId: string | number;
    headerContent: ReactNode; // Left-side avatar + title/subtitle block inside the header row
    subHeader?: ReactNode; // Optional card shown beneath the header (e.g. the listing card)
    footerExtra?: ReactNode; // Extra node rendered after the KeyboardAvoidingView (e.g. modals)
    flatListRef: RefObject<FlatList | null>;
    messages: MessageRecord[];
    isLoading: boolean;
    listEmptyText?: string;
    inputProps: MessageInputProps; // Spread the props from MessageInputBox
    renderMessage: (item: MessageRecord, index: number) => ReactNode;
    messageGap?: number | string; // Spacing between messages.
};

const ChatScreenLayout = ({
    headerContent,
    subHeader,
    flatListRef,
    messages,
    isLoading,
    listEmptyText = "Send a message to get started",
    inputProps,
    renderMessage,
    messageGap = 2.5,
}: ChatScreenLayoutProps) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [actionsVisible, setActionsVisible] = useState(false);
    const { onPressImage, ...messageInputProps } = inputProps;

    const handlePressPlus = () => {
        if (inputProps.onPressPlus) {
            inputProps.onPressPlus();
        }
        setActionsVisible(true);
    };

    const renderItem: ListRenderItem<MessageRecord> = ({ item, index }) => {
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
            {isLoading ? (
                <FDMLoader />
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
                            <Text className="self-center text-fdm-fg/30 text-sm mt-4">
                                {listEmptyText}
                            </Text>
                        }
                    />
                    {/* Input box */}
                    <View
                        className="flex-row items-end px-4 py-2 bg-fdm-bg"
                    >
                        <MessageInputBox
                            {...messageInputProps}
                            onPressPlus={handlePressPlus}
                            placeholder="Message"
                        />
                    </View>
                    <ComposerActionsModal
                        visible={actionsVisible}
                        onClose={() => setActionsVisible(false)}
                        onSelectImage={onPressImage}
                    />
                </KeyboardAvoidingView>
            )}
        </View>
    );
};

export default ChatScreenLayout;
