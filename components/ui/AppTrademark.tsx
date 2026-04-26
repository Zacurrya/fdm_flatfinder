import React from "react";
import { Text, View } from "react-native";

type AppTrademarkProps = {
  className?: string;
  marginTop?: number;
};

/**
 * AppTrademark
 * A stylized trademark and version tag for the FDM Flatfinder app.
 */
const AppTrademark: React.FC<AppTrademarkProps> = ({ className, marginTop }) => {
  return (
    <View 
      className={`items-center justify-center ${className}`}
      style={marginTop !== undefined ? { marginTop } : { marginTop: 48 }} // 48 is the default mt-12 (12 * 4)
    >
      <Text className="text-white/20 text-[10px] uppercase tracking-[4px] font-medium">
        FDM Flatfinder v1.2.0
      </Text>
    </View>
  );
};

export default AppTrademark;
