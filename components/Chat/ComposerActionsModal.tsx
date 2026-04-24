import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

type ComposerActionItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
};

type ComposerActionsModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectImage?: () => void;
  onTakePhoto?: () => void;
  onSendLocation?: () => void;
};

const ComposerActionsModal = ({
  visible,
  onClose,
  onSelectImage,
}: ComposerActionsModalProps) => {
  const actions: ComposerActionItem[] = [
    {
      icon: "image",
      label: "Photo Library",
      onPress: () => {
        onClose();
        onSelectImage?.();
      },
      color: "#ccff00"
    }
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1" onPress={onClose}>
        <View className="flex-1 justify-end bg-black/40">
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-[#121212] rounded-t-[32px] border-t border-white/10 px-6 pt-2 pb-12">
              <View className="w-12 h-1.5 rounded-full bg-white/10 self-center mb-8 mt-2" />

              <View className="flex-row flex-wrap justify-between">
                {actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={action.onPress}
                    className="items-center w-[30%] mb-6"
                  >
                    <View
                      className="w-16 h-16 rounded-2xl bg-white/5 items-center justify-center mb-2 border border-white/5"
                    >
                      <Ionicons name={action.icon} size={28} color={action.color || "white"} />
                    </View>
                    <Text className="text-white/60 text-xs font-medium">{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ComposerActionsModal;
