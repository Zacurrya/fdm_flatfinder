import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, TouchableOpacity } from "react-native";

type ShareListingButtonProps = {
  onShare: () => Promise<void>;
  cityName?: string;
  loading?: boolean;
};

/**
 * ShareListingButton
 * A reusable button with built-in confirmation for sharing a listing to a city group chat.
 */
const ShareListingButton: React.FC<ShareListingButtonProps> = ({ onShare, cityName, loading }) => {
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
      className={`h-12 w-12 bg-black/40 rounded-full items-center justify-center backdrop-blur-md border border-white/10 ${loading ? 'opacity-50' : ''}`}
      onPress={handleSharePress}
      disabled={loading}
    >
      <Ionicons name="share-social-outline" size={22} color="white" />
    </TouchableOpacity>
  );
};

export default ShareListingButton;
