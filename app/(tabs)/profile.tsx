import ProfileCard from "@components/profile/ProfileCard";
import ProfilePicModal from "@components/profile/ProfilePicModal";
import SettingsModal from "@components/profile/SettingsModal";
import SignOutButton from "@components/profile/SignOutButton";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

export default function ProfileScreen() {
  const { user, updateProfilePicture, removeProfilePicture } = useAuth();
  const { width, height } = useWindowDimensions();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState(false);
  const [isRemovingProfilePicture, setIsRemovingProfilePicture] = useState(false);
  const [isProfilePictureModalVisible, setIsProfilePictureModalVisible] = useState(false);
  const isProfilePictureBusy = isUploadingProfilePicture || isRemovingProfilePicture;

  const handleChangeProfilePicture = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow photo library access to upload a profile picture.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (pickerResult.canceled || !pickerResult.assets?.length) {
      return;
    }

    const imageUri = pickerResult.assets[0].uri;
    if (!imageUri) {
      Alert.alert("Upload failed", "No image was selected.");
      return;
    }

    // Ensure the selected image can be read before triggering upload.
    try {
      await new File(imageUri).arrayBuffer();
    } catch {
      Alert.alert("Upload failed", "Selected profile picture could not be read.");
      return;
    }

    setIsUploadingProfilePicture(true);
    try {
      const uploadResult = await updateProfilePicture({
        imageUri,
        mimeType: pickerResult.assets[0].mimeType,
        fileName: pickerResult.assets[0].fileName,
      });
      if (!uploadResult.success) {
        Alert.alert("Upload failed", uploadResult.error || "Please try again.");
      }
    } finally {
      setIsUploadingProfilePicture(false);
    }
  };

  const handleRemoveProfilePicture = () => {
    if (!user?.profilePicture) {
      return;
    }

    Alert.alert(
      "Remove profile picture?",
      "This will reset your profile picture to the fallback avatar.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setIsRemovingProfilePicture(true);
            void removeProfilePicture()
              .then((removeResult) => {
                if (!removeResult.success) {
                  Alert.alert("Remove failed", removeResult.error || "Please try again.");
                }
              })
              .finally(() => {
                setIsRemovingProfilePicture(false);
              });
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" hidden={width > height} />

      <BackgroundCircle top={0} right={0} color="#CCFF001A" opacity={0.5} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className={`${width > height ? "pt-6" : "pt-16"} pb-4 px-6 z-10 flex-row items-center justify-between`}>
          <Text
            className="text-fdm-fg text-2xl tracking-tighter"
            style={{ fontFamily: "Michroma_400Regular" }}
          >
            Your <Text className="text-fdm-accent">Profile</Text>
          </Text>
          <TouchableOpacity
            className="w-11 h-11 items-center justify-center rounded-full bg-fdm-fg/10 active:bg-fdm-fg/20 border border-fdm-fg/10"
            onPress={() => setIsSettingsVisible(true)}
            accessibilityLabel="Open settings"
          >
            <Ionicons name="settings-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View className="px-6">
          <ProfileCard
            user={user}
            onPressProfilePicture={() => setIsProfilePictureModalVisible(true)}
            isUploadingProfilePicture={isProfilePictureBusy}
          />
        </View>

        {/* Sign Out Button */}
        <View className="items-center mt-8">
          <SignOutButton />
        </View>
      </ScrollView>

      <SettingsModal
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
      />

      <ProfilePicModal
        visible={isProfilePictureModalVisible}
        user={user}
        isUploadingProfilePicture={isProfilePictureBusy}
        onClose={() => setIsProfilePictureModalVisible(false)}
        onChangeProfilePicture={handleChangeProfilePicture}
        onRemoveProfilePicture={handleRemoveProfilePicture}
      />
    </View>
  );
}
