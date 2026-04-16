import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type AwaitingApprovalViewProps = {
  title?: string;
  message?: string;
};

export default function AwaitingApprovalView({
  title = "Awaiting Admin Approval",
  message = "Your account is awaiting admin approval.",
}: AwaitingApprovalViewProps) {
  const iconName = title === "Account Denied" ? "sad-outline" : "hourglass-outline";

  return (
    <View className="flex-1 bg-fdm-bg items-center justify-center px-8">
      <Ionicons name={iconName} size={48} color="#ffffff40" />
      <Text className="text-fdm-fg text-lg font-semibold mt-4 text-center">
        {title}
      </Text>
      <Text className="text-fdm-fg/60 text-sm mt-2 text-center">{message}</Text>
    </View>
  );
}
