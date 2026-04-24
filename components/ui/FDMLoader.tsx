import { Image } from "expo-image";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming 
} from "react-native-reanimated";

type FDMLoaderProps = {
  fullScreen?: boolean;
  caption?: string;
};

const FDMLoader = ({ fullScreen = true, caption }: FDMLoaderProps) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(0.9, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <View className="items-center justify-center gap-4">
      <Animated.View style={animatedStyle} className="items-center justify-center">
        <Image
          source={require("@assets/images/logo.svg")}
          style={{ width: 80, height: 80 }}
          contentFit="contain"
          tintColor="#ccff00"
        />
      </Animated.View>
      {caption ? (
        <Text className="text-fdm-fg/60 text-sm tracking-wider uppercase font-medium">
          {caption}
        </Text>
      ) : null}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="absolute inset-0 bg-fdm-bg items-center justify-center z-50">
        {content}
      </View>
    );
  }

  return content;
};

export default FDMLoader;

