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
      <View className="flex-row items-center px-8 pb-4 mt-12">
        <View className="flex-row items-center gap-20 mt-10">
        {/* Logo + Greeting */}
        <View>
          <Image
            source={require("@assets/images/logo.svg")}
            style={{ width: 120, height: 30 }}
            contentFit="contain"
            tintColor="#ccff00"
          />
          <Text
            className="text-fdm-accent text-2xl tracking-tighter mt-1 w-[120px] text-center"
            style={{ fontFamily: "Michroma_400Regular" }}
          >
            {cityName}
          </Text>
        </View>

        {/* City Image */}
        <View className="h-28 w-16">
          <CityImage officeLocation={officeLocation} />
        </View>
        </View>
        
        {/* Notifications Button */}
        <View className="absolute top-7 right-9">
        <NotificationButton 
          onPressNotifications={onPressNotifications}
        />
        </View>
      </View>
  );
}
