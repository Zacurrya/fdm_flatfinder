import { Ionicons } from "@expo/vector-icons";
import { Image, TextInput, TouchableOpacity, View } from "react-native";

type MessageInputBoxProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  onSend?: () => void;
  sendDisabled?: boolean;
  onPressPlus?: () => void;
  actionsDisabled?: boolean;
  showActions?: boolean;
  attachment?: { uri: string; type: "image" } | null;
  onClearAttachment?: () => void;
};

const MessageInputBox = ({
  value,
  onChangeText,
  placeholder = "Message",
  editable = true,
  onSend,
  sendDisabled = false,
  onPressPlus,
  actionsDisabled = false,
  showActions = true,
  attachment,
  onClearAttachment,
}: MessageInputBoxProps) => {
  const rightInsetClassName = showActions ? "pr-28" : "pr-12";

  return (
    <View className="flex-1 bg-fdm-fg/10 border border-fdm-fg/10 rounded-3xl px-2 mx-2">
      {attachment?.type === "image" ? (
        <View className="flex-row items-center mb-2 px-1">
          <View className="relative">
            <Image
              source={{ uri: attachment.uri }}
              className="w-16 h-16 rounded-xl border border-fdm-fg/10"
            />
            <TouchableOpacity
              onPress={onClearAttachment}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-fdm-bg border border-fdm-fg/20 items-center justify-center shadow-lg"
            >
              <Ionicons name="close" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#ffffff40"
        multiline
        maxLength={1000}
        editable={editable}
        className={`text-fdm-fg text-base ${rightInsetClassName}`}
        style={{ maxHeight: 120, minHeight: 40 }}
      />

      {/* Action buttons modal */}
      <View
        className="absolute bottom-2 right-2 flex-row gap-1"
      >
        {showActions ? (
          <>
            <TouchableOpacity
              onPress={onPressPlus}
              disabled={actionsDisabled}
              className="w-8 h-8 rounded-full items-center justify-center"
            >
              <Ionicons name="add" size={20} color={actionsDisabled ? "#ffffff30" : "#ffffff90"} />
            </TouchableOpacity>
          </>
        ) : null}
        {/* Send button */}
        <TouchableOpacity
          onPress={onSend}
          disabled={sendDisabled}
          className={`w-8 h-8 rounded-full items-center justify-center ${
            sendDisabled ? "bg-fdm-fg/10" : "bg-fdm-accent"
          }`}
        >
          <Ionicons
            name="send"
            size={14}
            color={sendDisabled ? "#ffffff30" : "#1a1a1a"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MessageInputBox;
