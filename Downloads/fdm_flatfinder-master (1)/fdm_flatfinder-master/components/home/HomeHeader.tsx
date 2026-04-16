import NotificationButton from "@/components/home/NotificationButton";
import CityImage from "@/components/ui/CityImage";
import { Image } from "expo-image";
import { Text, View, useWindowDimensions } from "react-native";

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
  const { width, height } = useWindowDimensions();

  return (
      <View className={`${width > height ? "pt-6" : "pt-16"} pb-4 px-6 z-10 flex-row items-center justify-between`}>
        <View className="flex-row items-center gap-20">
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

        <NotificationButton 
          onPressNotifications={onPressNotifications}
        />
      </View>
  );
}
