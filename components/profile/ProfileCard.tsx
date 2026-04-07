import ProfileAvatar from "@components/profile/ProfileAvatar";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@services/auth/auth.types";
import { Text, View } from "react-native";

interface ProfileCardProps {
  user: User | null;
  onPressProfilePicture?: () => void;
  isUploadingProfilePicture?: boolean;
}

export default function ProfileCard({
  user,
  onPressProfilePicture,
  isUploadingProfilePicture = false,
}: ProfileCardProps) {
  return (
      <View className="p-6 mt-4 bg-fdm-fg/5 border border-fdm-fg/10 rounded-3xl">
        <View className="flex-row items-center gap-4 mb-6">

          {/* Profile picture */}
          <ProfileAvatar
            user={user}
            onPress={onPressProfilePicture}
            isUploadingProfilePicture={isUploadingProfilePicture}
          />
          {/* Name and Role */}
          <View>
            <Text className="text-fdm-fg font-bold text-lg">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-fdm-fg/50 text-sm mt-0.5">
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
}
