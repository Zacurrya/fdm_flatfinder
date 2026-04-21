import { Ionicons } from "@expo/vector-icons";
import { User } from "@services/auth/types";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import ApprovalRequestCard from "./ApprovalRequestCard";

type AdminValidationRequestsProps = {
  isLoading: boolean;
  pendingUsers: User[];
  processingId: string | null;
  onApprove: (user: User) => void;
  onReject: (user: User) => void;
};

export default function AdminValidationRequests({
  isLoading,
  pendingUsers,
  processingId,
  onApprove,
  onReject,
}: AdminValidationRequestsProps) {
  const renderUserCard = ({ item }: { item: User }) => {
    const isProcessing = processingId === item.userId;

    return (
      <ApprovalRequestCard
        user={item}
        isProcessing={isProcessing}
        onApprove={onApprove}
        onReject={onReject}
      />
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#ccff00" size="large" />
      </View>
    );
  }

  if (pendingUsers.length === 0) {
    return (
      <FlatList
        data={[]}
        renderItem={null}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center px-6">
            <Ionicons name="checkmark-done-circle-outline" size={64} color="#ccff0040" />
            <Text className="text-fdm-fg/50 text-base mt-4 text-center">No pending approval requests.</Text>
            <Text className="text-fdm-fg/30 text-sm mt-1 text-center">New requests will appear here.</Text>
          </View>
        }
      />
    );
  }

  return (
    <FlatList
      data={pendingUsers}
      renderItem={renderUserCard}
      keyExtractor={(item) => item.userId}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
