import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

type MessageSendButtonProps = {
  onPress: () => void;
  disabled: boolean;
};

export default function MessageSendButton({ onPress, disabled }: MessageSendButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`w-11 h-11 rounded-full items-center justify-center ${
        disabled ? "bg-fdm-fg/10" : "bg-fdm-accent"
      }`}
    >
      <Ionicons
        name="send"
        size={18}
        color={disabled ? "#ffffff30" : "#1a1a1a"}
      />
    </TouchableOpacity>
  );
}
