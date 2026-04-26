import React from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

const ListingCardSkeleton = () => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      className="bg-fdm-fg/5 rounded-3xl mb-4 border border-fdm-fg/10 overflow-hidden"
      style={{ height: 260 }}
    >
      {/* Photo Placeholder */}
      <Animated.View
        style={[animatedStyle, { height: 160 }]}
        className="bg-fdm-fg/10 w-full"
      />

      {/* Content Placeholder */}
      <View className="p-4 gap-2">
        <View className="flex-row justify-between items-center">
          <Animated.View style={[animatedStyle, { width: '60%', height: 20 }]} className="bg-fdm-fg/10 rounded-lg" />
          <Animated.View style={[animatedStyle, { width: '25%', height: 24 }]} className="bg-fdm-accent/20 rounded-xl" />
        </View>

        <Animated.View style={[animatedStyle, { width: '40%', height: 14 }]} className="bg-fdm-fg/10 rounded-lg mt-1" />

        {/* Specs Placeholder */}
        <View className="flex-row gap-4 pt-2 border-t border-fdm-fg/5">
          <Animated.View style={[animatedStyle, { width: 60, height: 16 }]} className="bg-fdm-fg/10 rounded-lg" />
          <Animated.View style={[animatedStyle, { width: 60, height: 16 }]} className="bg-fdm-fg/10 rounded-lg" />
        </View>
      </View>
    </View>
  );
};

export default ListingCardSkeleton;
