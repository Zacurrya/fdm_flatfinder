import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { GestureResponderEvent, StyleProp, TouchableOpacity, ViewStyle } from "react-native";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

type ListingIconButtonProps = {
  iconName: IoniconsName;
  iconColor?: string;
  size?: number;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  stopPropagation?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * @params iconName, iconColor, size, onPress, disabled, stopPropagation, style
 * A reusable icon button component.
 */
const ListingIconButton: React.FC<ListingIconButtonProps> = ({
  iconName,
  iconColor = "#ffffff",
  size = 24,
  onPress,
  disabled = false,
  stopPropagation = false,
  style,
}) => {
  const handlePress = (event: GestureResponderEvent) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    onPress(event);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[
        {
          backgroundColor: "rgba(0,0,0,0.4)",
          padding: 8,
          borderRadius: 999,
        },
        style,
      ]}
    >
      <Ionicons name={iconName} size={size} color={iconColor} />
    </TouchableOpacity>
  );
};

export default ListingIconButton;