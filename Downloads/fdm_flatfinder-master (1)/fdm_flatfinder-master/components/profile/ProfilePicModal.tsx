import ProfilePic from "@components/profile/ProfilePic";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@services/auth/auth.types";
import { Modal, Pressable, Text, TouchableOpacity } from "react-native";

type ProfilePicModalProps = {
  visible: boolean;
  user: User | null;
  isUploadingProfilePicture: boolean;
  onClose: () => void;
  onChangeProfilePicture: () => void;
  onRemoveProfilePicture: () => void;
};

export default function ProfilePicModal({
  visible,
  user,
  isUploadingProfilePicture,
  onClose,
  onChangeProfilePicture,
  onRemoveProfilePicture,
}: ProfilePicModalProps) {
  const canRemoveProfilePicture = Boolean(user?.profilePicture);

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

          <ProfilePic user={user} isUploadingProfilePicture={isUploadingProfilePicture} size={176} />

          {/* Change Profile Picture Button */}
          <TouchableOpacity
            className="w-[80%] mt-6 rounded-xl bg-fdm-accent py-3 items-center"
            onPress={onChangeProfilePicture}
            disabled={isUploadingProfilePicture}
          >
            <Text className="text-black font-semibold">
              {isUploadingProfilePicture ? "Updating..." : "Change profile picture"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-[80%] mt-3 rounded-xl border border-fdm-fg/20 py-3 items-center disabled:opacity-40"
            onPress={onRemoveProfilePicture}
            disabled={isUploadingProfilePicture || !canRemoveProfilePicture}
          >
            <Text className="text-fdm-fg font-semibold">Remove profile picture</Text>
          </TouchableOpacity>

        </Pressable>
      </Pressable>
    </Modal>
  );
}
