import { Ionicons } from "@expo/vector-icons";
import { User } from "@services/auth/types";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type ApprovalRequestCardProps = {
  user: User;
  isProcessing: boolean;
  onApprove: (user: User) => void;
  onReject: (user: User) => void;
};

export default function ApprovalRequestCard({
  user,
  isProcessing,
  onApprove,
  onReject,
}: ApprovalRequestCardProps) {
  return (
    <View className="bg-fdm-fg/5 border border-fdm-fg/10 rounded-3xl p-5 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-12 h-12 rounded-full bg-fdm-accent/15 border border-fdm-accent/20 items-center justify-center">
            <Text className="text-fdm-accent font-bold text-lg">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-fdm-fg font-bold text-base">
              {user.firstName} {user.lastName}
            </Text>
            <Text className="text-fdm-fg/40 text-xs mt-0.5">
              Registered {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View className="bg-yellow-500/15 border border-yellow-500/25 px-3 py-1 rounded-xl">
          <Text className="text-yellow-400 text-xs font-semibold uppercase">Pending</Text>
        </View>
      </View>

      <View className="gap-2.5 mb-5 pl-1">
        <View className="flex-row items-center gap-2.5">
          <Ionicons name="mail-outline" size={15} color="#ffffff60" />
          <Text className="text-fdm-fg/70 text-sm">{user.email || "Not provided"}</Text>
        </View>
        <View className="flex-row items-center gap-2.5">
          <Ionicons name="call-outline" size={15} color="#ffffff60" />
          <Text className="text-fdm-fg/70 text-sm">{user.phoneNumber || "Not provided"}</Text>
        </View>
        <View className="flex-row items-center gap-2.5">
          <Ionicons name="location-outline" size={15} color="#ffffff60" />
          <Text className="text-fdm-fg/70 text-sm">{user.officeLocation || "Not set"}</Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-fdm-accent py-3 rounded-2xl items-center active:opacity-80"
          onPress={() => onApprove(user)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#1b1b1b" size="small" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Ionicons name="checkmark-circle-outline" size={18} color="#1b1b1b" />
              <Text className="text-fdm-bg font-bold text-sm">Approve</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-red-500/15 border border-red-500/25 py-3 rounded-2xl items-center active:opacity-80"
          onPress={() => onReject(user)}
          disabled={isProcessing}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
            <Text className="text-red-400 font-bold text-sm">Reject</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
