import AwaitingApprovalView from "@components/ui/AwaitingApprovalView";
import { useAuth } from "@hooks/useAuth";
import { ScrollView, Text, View } from "react-native";

export default function FavouritesScreen() {
  const { user } = useAuth();

  if (user?.approvalStatus === "PENDING" || user?.approvalStatus === "REJECTED") {
    return (
      <AwaitingApprovalView
        title={user.approvalStatus === "REJECTED" ? "Account Denied" : "Awaiting Admin Approval"}
        message={
          user.approvalStatus === "REJECTED"
            ? "Your account has been denied. Please contact an administrator for more information."
            : "Your account is awaiting admin approval."
        }
      />
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-fdm-bg"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 items-center justify-center">
        <Text className="text-fdm-fg/40 text-sm">Favourites - coming soon</Text>
      </View>
    </ScrollView>
  );
}
