import NotificationButton from "@/components/home/NotificationButton";
import CityImage from "@/components/ui/CityImage";
import { Image } from "expo-image";
import { Text, View } from "react-native";

type HomeHeaderProps = {
  cityName: string;
  firstName?: string;
  officeLocation?: string;
  onPressNotifications?: () => void;
};

export default function HomeHeader({
  cityName,
  firstName,
  officeLocation,
  onPressNotifications = () => {},
}: HomeHeaderProps) {
  return (
      <View className="flex-row items-center gap-8 px-8 pb-4 mt-12">
        <View className="flex-row items-center gap-8 mt-10">
        {/* Logo + Greeting */}
        <View>
          <Image
            source={require("@assets/images/logo.svg")}
            style={{ width: 120, height: 20 }}
            contentFit="contain"
            tintColor="#ccff00"
          />
          <Text
            className="text-fdm-accent text-xl tracking-tighter mt-1 w-[120px] text-center"
            style={{ fontFamily: "Michroma_400Regular" }}
          >
            {cityName}
          </Text>
          <Text className="text-fdm-fg/50 text-sm mt-1">Welcome back, {firstName ?? ""} 👋</Text>
        </View>

        {/* City Image */}
        <View className="h-20 w-16">
          <CityImage officeLocation={officeLocation} />
        </View>
        </View>

        {/* Notifications Button */}
        <NotificationButton 
          onPressNotifications={onPressNotifications}
        />
      </View>
  );
}
