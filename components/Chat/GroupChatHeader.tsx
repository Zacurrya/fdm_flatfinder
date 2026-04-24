import CityImage from "@components/ui/CityImage";
import { Text, View } from "react-native";

type GroupChatHeaderProps = {
  imagePath: any;
  participantCount: number;
};

const GroupChatHeader = ({ imagePath, participantCount }: GroupChatHeaderProps) => {
  return (
    <>
      <View className="w-12 h-12 rounded-full bg-fdm-accent/20 border border-fdm-accent/30 items-center justify-center mr-3 overflow-hidden">
        <View className="h-8 w-8">
          <CityImage imagePath={imagePath} fitContainer />
        </View>
      </View>

      <View className="flex-1">
        <Text className="text-fdm-fg text-base font-semibold" numberOfLines={1}>
          Group Chat
        </Text>
        <Text className="text-fdm-fg/40 text-xs mt-0.5" numberOfLines={1}>
          {participantCount} {participantCount === 1 ? "person" : "people"} in this group
        </Text>
      </View>
    </>
  );
};

export default GroupChatHeader;
