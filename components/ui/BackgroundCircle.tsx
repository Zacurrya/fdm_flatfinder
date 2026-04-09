import type { DimensionValue } from "react-native";
import { useColorScheme, View } from "react-native";

type PositionValue = DimensionValue;

type BackgroundCircleProps = {
  top?: PositionValue;
  right?: PositionValue;
  bottom?: PositionValue;
  left?: PositionValue;
  color?: string;
  darkColor?: string;
  opacity?: number;
  size?: number;
};

export default function BackgroundCircle({
  top,
  right,
  bottom,
  left,
  color = "#CCFF001A",
  darkColor,
  opacity = 0.5,
  size = 256,
}: BackgroundCircleProps) {
  const colorScheme = useColorScheme();
  const resolvedColor = colorScheme === "dark" && darkColor ? darkColor : color;

  return (
    <View
      pointerEvents="none"
      className="absolute rounded-full blur-3xl"
      style={{
        top,
        right,
        bottom,
        left,
        width: size,
        height: size,
        backgroundColor: resolvedColor,
        opacity,
      }}
    />
  );
}