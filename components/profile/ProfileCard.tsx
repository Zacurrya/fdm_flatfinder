import { User } from "@/services/auth/auth.types";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface ProfileCardProps {
  user: User | null;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <View className="px-6 mt-4">
      <View className="bg-fdm-fg/5 border border-fdm-fg/10 rounded-3xl p-6">
        {/* Avatar + Name */}
        <View className="flex-row items-center gap-4 mb-6">
          <View className="w-16 h-16 rounded-full bg-fdm-accent/15 border border-fdm-accent/20 items-center justify-center">
            <Text className="text-fdm-accent font-bold text-xl">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </Text>
          </View>
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
    </View>
  );
}
