import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center px-6" onPress={onClose}>
        <Pressable className="bg-[#141414] border border-fdm-fg/10 rounded-2xl p-5 min-h-56">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-fdm-fg text-lg font-bold">Settings</Text>
            <TouchableOpacity
              className="w-9 h-9 rounded-full items-center justify-center bg-fdm-fg/10 border border-fdm-fg/10"
              onPress={onClose}
              accessibilityLabel="Close settings"
            >
              <Ionicons name="close" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Intentionally blank modal body for future settings content. */}
          <View className="flex-1" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
