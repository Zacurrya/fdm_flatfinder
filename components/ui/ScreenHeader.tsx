import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  highlightedTitle?: string;
  rightElement?: React.ReactNode;
  condensed?: boolean;
  hasSeparator?: boolean;
};

/**
 * A unified header component for tab screens.
 */
const ScreenHeader = ({
  title,
  subtitle,
  highlightedTitle,
  rightElement,
  condensed = false,
  hasSeparator = false
}: ScreenHeaderProps) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;

  const topPadding = condensed ? 24 : (isLandscape ? 24 : Math.max(insets.top + 16, 64));

  return (
    <View
      className={`${condensed ? "pt-6 pb-6" : (isLandscape ? "pt-6" : "pt-16")} px-6 mb-2 z-10 flex-row items-center justify-between ${hasSeparator ? "border-b border-white/5" : ""}`}
      style={{ paddingTop: topPadding }}
    >
      <View className="flex-1 mr-4">
        {subtitle && (
          <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">
            {subtitle}
          </Text>
        )}
        <Text className="text-white text-4xl font-extrabold tracking-tighter leading-tight">
          {title}
          {highlightedTitle && <Text className="text-fdm-accent"> {highlightedTitle}</Text>}
        </Text>
      </View>

      {rightElement && (
        <View>
          {rightElement}
        </View>
      )}
    </View>
  );
};

export default ScreenHeader;
