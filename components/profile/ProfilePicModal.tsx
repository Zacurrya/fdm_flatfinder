import ProfilePic from "@components/profile/ProfilePic";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@hooks/useAuth";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

type ProfilePicModalProps = {
  visible: boolean;
  onClose: () => void;
  onUpdate: () => Promise<any>;
  onRemove: () => Promise<any>;
};

/**
 * ProfilePicModal
 * A centered modal that allows users to view, change, or remove their profile picture.
 */
const ProfilePicModal = ({ visible, onClose, onUpdate, onRemove }: ProfilePicModalProps) => {
  const { user } = useAuth();

  const handleUpdate = async () => {
    const result = await onUpdate();
    if (result.success) onClose();
  };

  const handleRemove = async () => {
    const result = await onRemove();
    if (result.success) onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/60 justify-center items-center px-6"
        onPress={onClose}
      >
        <Pressable
          className="bg-fdm-bg border border-white/5 rounded-[32px] p-8 w-full max-w-sm items-center gap-y-6"
          onPress={(e) => e.stopPropagation()}
        >
          <TouchableOpacity
            className="absolute top-6 right-6 p-2 bg-white/5 rounded-full"
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color="#ffffff80" />
          </TouchableOpacity>

          <View className="p-1 rounded-full border-2 border-fdm-accent/30">
            <ProfilePic
              avatarUrl={user?.avatarUrl ?? null}
              size={120}
            />
          </View>

          <View className="items-center">
            <Text className="text-2xl font-bold text-white tracking-tight">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-white/40 text-sm mt-1 uppercase tracking-widest font-medium">Profile Picture</Text>
          </View>

          <View className="w-full gap-3 mt-2">
            <TouchableOpacity
              onPress={handleUpdate}
              className="bg-fdm-accent h-14 rounded-2xl flex-row items-center justify-center gap-2"
            >
              <Ionicons name="image" size={20} color="#1b1b1b" />
              <Text className="text-fdm-bg font-bold text-base">Change Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRemove}
              className="bg-white/5 h-14 rounded-2xl flex-row items-center justify-center gap-2 border border-white/5"
            >
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
              <Text className="text-red-400 font-bold text-base">Remove Photo</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ProfilePicModal;