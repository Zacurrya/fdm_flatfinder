import { Image } from "expo-image";
import { Text, View } from "react-native";

type HomeHeaderProps = {
  cityName: string;
  imagePath?: any;
};

const HomeHeader = ({
  cityName,
  imagePath,
}: HomeHeaderProps) => {

  return (
    <View className="px-3">
      <View className="flex-row items-center pt-16 mb-4 z-10 pb-4" style={{ gap: 10 }}>
        {/* Logo + City */}
        <View className="items-center">
          <Image
            source={require("@assets/images/logo.svg")}
            style={{ width: 140, height: 40 }}
            contentFit="contain"
            tintColor="#ccff00"
          />
          <Text
            className="text-fdm-accent text-lg tracking-tighter mt-1 w-[120px] text-center"
            style={{ fontFamily: "Michroma_400Regular" }}
          >
            {cityName}
          </Text>
        </View>

        {/* Vertical Divider */}
        <View className="h-20 bg-fdm-accent" style={{ width: 2 }} />

        {/* City Image */}
        <View className="h-24 w-28 items-center justify-center">
          {imagePath && (
            <Image
              source={imagePath}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              tintColor="#ccff00"
            />
          )}
        </View>
      </View>
    </View >
  );
};

export default HomeHeader;
