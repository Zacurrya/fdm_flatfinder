import IconButton from "@components/listing/IconButton";
import { StyleProp, ViewStyle } from "react-native";

type FavouriteListingButtonProps = {
  isFavourite?: boolean;
  toggleFavourite: () => void | Promise<void>;
  style?: StyleProp<ViewStyle>;
  size?: number;
  stopPropagation?: boolean;
};

const FavouriteListingButton = ({ isFavourite = false,
  toggleFavourite,
  style,
  size = 20,
  stopPropagation = false,
}: FavouriteListingButtonProps) => {
  return (
    <IconButton
      iconName={isFavourite ? "heart" : "heart-outline"}
      iconColor={isFavourite ? "#ef4444" : "#ffffff"}
      size={size}
      onPress={() => void toggleFavourite()}
      stopPropagation={stopPropagation}
      style={style}
    />
  );
};
export default FavouriteListingButton;
