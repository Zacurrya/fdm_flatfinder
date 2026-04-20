import MessageInputBox from "@components/Chat/MessageInputBox";
import { View } from "react-native";

type ChatComposerProps = {
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
};

export default function ChatComposer({
  value,
  onChangeText,
  placeholder = "Message...",
  onSend,
  sendDisabled,
  editable = true,
  showActions = true,
  onPressPlus,
  onPressImage,
  actionsDisabled = false,
}: ChatComposerProps) {
  return (
    <View className="flex-row items-end px-4 py-3 bg-fdm-bg">
      <MessageInputBox
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={editable}
        onSend={onSend}
        sendDisabled={sendDisabled}
        showActions={showActions}
        onPressPlus={onPressPlus}
        onPressImage={onPressImage}
        actionsDisabled={actionsDisabled}
      />
    </View>
  );
}
