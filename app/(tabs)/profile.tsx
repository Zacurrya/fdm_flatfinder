import ProfileCard from "@components/profile/ProfileCard";
import ProfilePicModal from "@components/profile/ProfilePicModal";
import SettingsModal from "@components/profile/SettingsModal";
import SignOutButton from "@components/profile/SignOutButton";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import AppTrademark from "@components/ui/AppTrademark";
import ScreenHeader from "@components/ui/ScreenHeader";
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
        <ScreenHeader
          title="Profile"
          rightElement={
            <TouchableOpacity
              className="w-12 h-12 items-center justify-center rounded-2xl bg-white/5 active:bg-white/10 border border-white/5"
              onPress={() => setIsSettingsVisible(true)}
              accessibilityLabel="Open settings"
            >
              <Ionicons name="settings-sharp" size={22} color="#ccff00" />
            </TouchableOpacity>
          }
        />

        {/* Profile Card */}
        <View className="px-6">
          <ProfileCard
            user={user}
            onPressProfilePicture={() => setIsProfilePictureModalVisible(true)}
            isUploadingProfilePicture={isProfilePictureBusy}
          />
        </View>

        {/* Account Actions Section Label */}
        <View className="px-6 mt-10 mb-4 flex-row items-center gap-2">
          <Ionicons name="key-outline" size={16} color="#ccff00" />
          <Text className="text-white/40 text-xs font-bold uppercase tracking-widest">Account Security</Text>
        </View>

        <View className="px-6">
          <View className="bg-white/5 border border-white/5 rounded-3xl p-6 items-center">
            <Text className="text-white/50 text-sm text-center mb-6 leading-relaxed">
              You are currently signed in as {user?.email}.
            </Text>
            <SignOutButton />
          </View>
        </View>

        <AppTrademark />
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
