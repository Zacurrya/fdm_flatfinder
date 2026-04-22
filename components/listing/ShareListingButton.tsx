import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, TouchableOpacity } from "react-native";

type ShareListingButtonProps = {
  onShare: () => Promise<void>;
  cityName?: string;
  loading?: boolean;
  size: number;
};

/**
 * ShareListingButton
 * A reusable button with built-in confirmation for sharing a listing to a city group chat.
 */
const ShareListingButton: React.FC<ShareListingButtonProps> = ({ onShare, cityName, loading, size }) => {
  const handleSharePress = () => {
    Alert.alert(
      "Share Listing",
      `Are you sure you want to share this listing to the ${cityName || 'city'} group chat?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Share", 
          onPress: async () => {
            await onShare();
          } 
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      className={`bg-black/40 rounded-full items-center justify-center backdrop-blur-md border border-white/10 ${loading ? 'opacity-50' : ''}`}
      onPress={handleSharePress}
      disabled={loading}
    >
      <Ionicons name="share-social-outline" size={size} color="white" />
    </TouchableOpacity>
  );
};

export default ShareListingButton;
