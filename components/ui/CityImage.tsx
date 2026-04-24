import { Image } from "expo-image";
import { View } from "react-native";

type CityImageProps = {
  imagePath?: any;
  fitContainer?: boolean;
};

const CityImage = ({ imagePath, fitContainer = false }: CityImageProps) => {
  if (!imagePath) return null;

  return (
    <View className={fitContainer ? "h-full w-full items-center justify-center" : "h-full w-28 items-center justify-center"}>
      <Image
        source={imagePath}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
        tintColor="#ccff00"
      />
    </View>
  );
}
export default CityImage;
