import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

type ImageUploadButtonProps = {
  onPress: () => void;
  disabled?: boolean;
};

export default function ImageUploadButton({ onPress, disabled = false }: ImageUploadButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`w-11 h-11 rounded-full items-center justify-center ${
        disabled ? "bg-fdm-fg/10" : "bg-fdm-fg/15 border border-fdm-fg/20"
      }`}
    >
      <Ionicons name="image-outline" size={18} color={disabled ? "#ffffff30" : "#ffffff90"} />
    </TouchableOpacity>
  );
}
