import { Text, View } from "react-native";
import { MessageProps } from "./types";

const AuditMessage = ({ content, timeLabel }: MessageProps) => {
  // Audit messages are typically centered, small system text.
  return (
    <View className="items-center my-2">
      <View className="bg-fdm-fg/5 px-3 py-1.5 rounded-full mt-2">
        <Text className="text-fdm-fg/50 text-xs text-center font-medium">
          {content}
        </Text>
      </View>
    </View>
  );
};

export default AuditMessage;
