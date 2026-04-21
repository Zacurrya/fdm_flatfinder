import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

type FDMLoaderProps = {
  fullScreen?: boolean;
};

export default function FDMLoader({ fullScreen = true }: FDMLoaderProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.25,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  const content = (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }} className="absolute self-center justify-center">
      <Image
        source={require("@assets/images/logo.svg")}
        style={{ width: 80, height: 80 }}
        contentFit="contain"
        tintColor="#ccff00"
      />
    </Animated.View>
  );

  if (fullScreen) {
    return (
      <View className="absolute inset-0 bg-fdm-bg self-center justify-center z-50">
        {content}
      </View>
    );
  }

  return content;
}
