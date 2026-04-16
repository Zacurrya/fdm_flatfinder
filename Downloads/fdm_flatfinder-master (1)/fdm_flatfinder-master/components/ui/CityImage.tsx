import { Image } from "expo-image";
import { View } from "react-native";

type CityImageProps = {
  officeLocation?: string;
};

const SKYLINE_SOURCES: Record<string, number> = {
  london: require("@assets/images/city-icons/london.svg"),
  "hong-kong": require("@assets/images/city-icons/hong-kong.svg"),
  singapore: require("@assets/images/city-icons/singapore.svg"),
  tokyo: require("@assets/images/city-icons/tokyo.svg"),
};

export default function CityImage({ officeLocation }: CityImageProps) {
  const officeLocationSlug = (officeLocation ?? "london")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const skylineSource = SKYLINE_SOURCES[officeLocationSlug] ?? SKYLINE_SOURCES.london;

  return (
    <View className="h-full w-28 items-center justify-center">
      <Image
        source={skylineSource}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
        tintColor="#ccff00"
      />
    </View>
  );
}
