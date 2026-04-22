
import { useAuth } from "@hooks/useAuth";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";

/**
 * useProfilePicture
 * Custom hook to handle the logic for selecting, uploading, and removing 
 * a user's profile picture.
 */

export function useProfilePicture() {
  const { user, updateProfilePicture, removeProfilePicture } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const isBusy = isUploading || isRemoving;

  // -- Profile picture update flow --
  const handleUpdate = async () => {
    // Check permissions
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to upload a profile picture."
      );
      return;
    }
    // Launch Picker
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false,
      exif: false,
    });

    if (pickerResult.canceled || !pickerResult.assets?.length) {
      return;
    }

    const asset = pickerResult.assets[0];
    const imageUri = asset.uri;

    // File Safety Check
    try {
      await new File(imageUri).arrayBuffer();
    } catch {
      Alert.alert("Upload failed", "Selected profile picture could not be read.");
      return;
    }

    // Trigger Upload 
    setIsUploading(true);
    try {
      const result = await updateProfilePicture({
        imageUri,
        mimeType: asset.mimeType,
        fileName: asset.fileName,
      });

      if (!result.success) {
        Alert.alert("Upload failed", result.error || "Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // -- Profile picture removal flow --
  const handleRemove = () => {
    if (!user?.profilePicture) return;
    Alert.alert(
      "Remove profile picture?",
      "This will reset your profile picture to the fallback avatar.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsRemoving(true);
            try {
              const result = await removeProfilePicture();
              if (!result.success) {
                Alert.alert("Remove failed", result.error || "Please try again.");
              }
            } finally {
              setIsRemoving(false);
            }
          },
        },
      ]
    );
  };

  return {
    isBusy,
    handleUpdate,
    handleRemove,
  };
}