import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import BackgroundCircle from "./BackgroundCircle";

type AwaitingApprovalViewProps = {
  title?: string;
  subtitle?: string;
};

const AwaitingApprovalView = ({
  title = "Account Pending Approval",
  subtitle = "Our admin team is currently reviewing your registration. You'll have full access once approved.",
}: AwaitingApprovalViewProps) => {
  return (
    <View className="flex-1 bg-fdm-bg items-center justify-center p-8">
      <BackgroundCircle size={400} y={-100} x="80%" opacity={0.05} />

      <View className="w-20 h-20 bg-fdm-accent/10 rounded-3xl items-center justify-center mb-8 border border-fdm-accent/20">
        <Ionicons name="time-outline" size={40} color="#ccff00" />
      </View>

      <Text className="text-fdm-fg text-2xl font-bold text-center mb-4">{title}</Text>
      <Text className="text-fdm-fg/60 text-center leading-6 text-base">{subtitle}</Text>
    </View>
  );
};

export default AwaitingApprovalView;
