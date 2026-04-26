import ProfileAvatar from "@components/profile/ProfilePic";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@hooks/general/useAuth";
import { useProfilePicture } from "@hooks/useProfilePicture";
import { Text, View } from "react-native";

interface ProfileCardProps {
  onPressProfilePicture?: () => void;
  isUploadingProfilePicture?: boolean;
}

const ProfileCard = ({
  onPressProfilePicture,
  isUploadingProfilePicture = false,
}: ProfileCardProps) => {
  const { user } = useAuth();
  const { avatarUrl, isLoading } = useProfilePicture(user?.userId);

  return (
    <View className="pt-3 pb-5 pl-5 mt-4 bg-fdm-fg/5 border border-fdm-fg/10 rounded-3xl">

      <View className="flex-row items-center gap-5 mb-7">
        {/* Profile picture */}
        <ProfileAvatar
          avatarUrl={avatarUrl}
          onPress={onPressProfilePicture}
          isUploading={isUploadingProfilePicture || isLoading}
          showEditIcon={true}
          size={100}
        />

        {/* Name and Role */}
        <View className="flex-1">
          <Text className="text-fdm-fg font-bold text-xl">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-fdm-fg/50 text-base mt-1">
            {user?.role === "ADMIN" ? "Administrator" : "Consultant"}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View className="gap-4">
        <View className="flex-row items-center gap-3">
          <Ionicons name="mail-outline" size={18} color="#ffffff60" />
          <Text className="text-fdm-fg/70 text-sm">{user?.email || "—"}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Ionicons name="call-outline" size={18} color="#ffffff60" />
          <Text className="text-fdm-fg/70 text-sm">{user?.phoneNumber || "—"}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Ionicons name="location-outline" size={18} color="#ffffff60" />
          <Text className="text-fdm-fg/70 text-sm">{user?.officeLocation || "—"}</Text>
        </View>
      </View>

    </View>
  );
};

export default ProfileCard;
