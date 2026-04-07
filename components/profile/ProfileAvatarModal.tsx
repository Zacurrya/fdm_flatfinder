import { User } from "@/services/auth/auth.types";
import ProfileAvatar from "@components/profile/ProfileAvatar";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, TouchableOpacity } from "react-native";

type ProfileAvatarModalProps = {
  visible: boolean;
  user: User | null;
  isUploadingProfilePicture: boolean;
  onClose: () => void;
  onChangeProfilePicture: () => void;
};

export default function ProfileAvatarModal({
  visible,
  user,
  isUploadingProfilePicture,
  onClose,
  onChangeProfilePicture,
}: ProfileAvatarModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/70 items-center justify-center" onPress={onClose}>
        <Pressable
          className="w-full max-w-sm bg-[#141414] border border-fdm-fg/10 rounded-3xl p-6 items-center"
          onPress={(event) => event.stopPropagation()}
        >
          <TouchableOpacity
            className="absolute top-4 right-4 w-9 h-9 rounded-full items-center justify-center bg-fdm-fg/10 border border-fdm-fg/10"
            onPress={onClose}
            disabled={isUploadingProfilePicture}
            accessibilityLabel="Close profile picture modal"
          >
            <Ionicons name="close" size={18} color="#ffffff" />
          </TouchableOpacity>

          <ProfileAvatar user={user} isUploadingProfilePicture={isUploadingProfilePicture} size={176} />

          <TouchableOpacity
            className="w-[80%] mt-6 rounded-xl bg-fdm-accent py-3 items-center"
            onPress={onChangeProfilePicture}
            disabled={isUploadingProfilePicture}
          >
            <Text className="text-black font-semibold">
              {isUploadingProfilePicture ? "Uploading..." : "Change profile picture"}
            </Text>
          </TouchableOpacity>

        </Pressable>
      </Pressable>
    </Modal>
  );
}
