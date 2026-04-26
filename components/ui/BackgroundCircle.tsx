import { DimensionValue, View } from "react-native";

type BackgroundCircleProps = {
  x?: DimensionValue;
  y?: DimensionValue;
  color?: string;
  darkColor?: string;
  opacity?: number;
  size?: number;
};

const BackgroundCircle = ({
  size = 300,
  color = "#ccff00",
  opacity = 0.1,
  x = 0,
  y = 0,
}: BackgroundCircleProps) => {
  return (
    <View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: 1000,
        backgroundColor: color,
        opacity,
        left: x,
        top: y,
      }}
    />
  );
};

export default BackgroundCircle;
