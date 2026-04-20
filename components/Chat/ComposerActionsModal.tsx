import { Modal, Pressable, View } from "react-native";

type ComposerActionsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function ComposerActionsModal({ visible, onClose }: ComposerActionsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1" onPress={onClose}>
        <View className="flex-1 justify-end">
          <Pressable onPress={() => undefined}>
            <View className="bg-fdm-bg rounded-t-3xl border-t border-fdm-fg/10 min-h-[220px] px-6 pt-4">
              <View className="w-12 h-1.5 rounded-full bg-fdm-fg/20 self-center" />
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
