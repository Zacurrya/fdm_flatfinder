import CityImage from "@components/ui/CityImage";
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
    <View className="pt-16 mb-8 px-6 z-10">
      <View className="flex-row items-center pb-6" style={{ gap: 16 }}>
        {/* Logo + City */}
        <View className="items-center">
          <Image
            source={require("@assets/images/logo.svg")}
            style={{ width: 120, height: 35 }}
            contentFit="contain"
            tintColor="#ccff00"
          />
          <Text
            className="text-fdm-accent text-xl tracking-tighter mt-1 w-[120px] text-center"
            style={{ fontFamily: "Michroma_400Regular" }}
          >
            {cityName}
          </Text>
        </View>

        {/* Vertical Divider */}
        <View className="h-20 bg-fdm-accent" style={{ width: 2 }} />

        {/* City Image */}
        <View className="h-24">
          <CityImage imagePath={imagePath} />
        </View>
      </View>

      {/* Subtle bottom separator line */}
      <View style={{ width: "95%", height: 2, backgroundColor: "#ccff0055", alignSelf: "center" }} />
    </View>
  );
};

export default HomeHeader;
