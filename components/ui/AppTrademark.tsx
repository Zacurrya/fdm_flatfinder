import React from "react";
import { Text, View } from "react-native";

type AppTrademarkProps = {
  className?: string;
};

/**
 * AppTrademark
 * A stylized trademark and version tag for the FDM Flatfinder app.
 */
const AppTrademark: React.FC<AppTrademarkProps> = ({ className }) => {
  return (
    <View className={`mt-12 items-center justify-center ${className}`}>
      <Text className="text-white/20 text-[10px] uppercase tracking-[4px] font-medium">
        FDM Flatfinder v1.2.0
      </Text>
    </View>
  );
};

export default AppTrademark;
