import { LocationChangeForm } from "@components/profile/LocationChangeForm";
import ProfileCard from "@components/profile/ProfileCard";
import ProfilePic from "@components/profile/ProfilePic";
import SignOutButton from "@components/profile/SignOutButton";
import AppTrademark from "@components/ui/AppTrademark";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import FDMLoader from "@components/ui/FDMLoader";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@hooks/general/useAuth";
import { useProfilePicture } from "@hooks/useProfilePicture";
import { useUserSettings } from "@hooks/useUserSettings";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

type ProfileModalProps = {
  visible: boolean;
  onClose: () => void;
};

type ProfileView = "PROFILE" | "SETTINGS" | "PROFILE_PICTURE";

const ProfileModal = ({ visible, onClose }: ProfileModalProps) => {
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState<ProfileView>("PROFILE");

  // Reset to main profile view when modal is closed, ensuring the modal re-opens on the profile tab
  useEffect(() => {
    if (!visible) {
      setCurrentView("PROFILE");
    }
  }, [visible]);

  // UI Logic Hooks
  const settings = useUserSettings(currentView === "SETTINGS");
  const {
    isUpdating: isUpdatingProfilePic,
    changeProfilePicture: updateProfilePic,
    deleteProfilePicture: removeProfilePic,
  } = useProfilePicture(user?.userId);

  const isBusy = isUpdatingProfilePic || settings.isSubmittingCityChange;

  if (!user) return null;

  const handleUpdatePic = async () => {
    await updateProfilePic();
    setCurrentView("PROFILE");
  };

  const handleDeletePic = async () => {
    await removeProfilePic();
    setCurrentView("PROFILE");
  };

  // -- Profile View -- 
  const renderProfileView = () => (
    <ScrollView
      className="flex-grow-0"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <ProfileCard
        onPressProfilePicture={() => setCurrentView("PROFILE_PICTURE")}
        isUploadingProfilePicture={isUpdatingProfilePic}
      />

      <View className="mt-6 gap-4">
        <TouchableOpacity
          onPress={() => setCurrentView("SETTINGS")}
          className="flex-row items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 active:bg-white/10"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-fdm-accent/10 items-center justify-center">
              <Ionicons name="settings-outline" size={20} color="#ccff00" />
            </View>
            <Text className="text-white text-lg font-medium">Account Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ffffff30" />
        </TouchableOpacity>
      </View>

      <View className="mt-8">
        <AppTrademark />
      </View>
    </ScrollView>
  );

  // -- Settings View --
  const renderSettingsView = () => (
    <ScrollView
      className="flex-grow-0"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 18 }}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View>
        <Text className="text-white/60 text-sm font-bold uppercase tracking-widest mb-4">Location Settings</Text>
        <LocationChangeForm
          citiesByRegion={settings.citiesByRegion}
          selectedCity={settings.selectedCity}
          selectedRegion={settings.selectedRegion}
          onSelectCity={settings.handleSelectCity}
          onSubmit={settings.handleRequestCityChange}
          isSubmitting={settings.isSubmittingCityChange}
          errorMessage={settings.locationsError || undefined}
          successMessage={settings.cityMessage || undefined}
        />
      </View>
    </ScrollView>
  );

  // -- Profile Picture View --
  const renderProfilePictureView = () => (
    <View className="items-center px-6 py-10">
      <View className="relative">
        <View className="p-2 bg-white/5 rounded-full border border-white/10">
          <ProfilePic size={160} />
        </View>
        {isUpdatingProfilePic && (
          <View className="absolute inset-0 items-center justify-center bg-black/40 rounded-full">
            <FDMLoader />
          </View>
        )}
      </View>

      <View className="w-full mt-12 gap-4">
        <TouchableOpacity
          onPress={handleUpdatePic}
          disabled={isUpdatingProfilePic}
          className="bg-fdm-accent h-16 rounded-3xl items-center justify-center shadow-lg shadow-fdm-accent/20 active:opacity-90"
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="image-outline" size={24} color="black" />
            <Text className="text-black font-black text-lg uppercase tracking-widest">Change Photo</Text>
          </View>
        </TouchableOpacity>

        {user.avatarUrl && (
          <TouchableOpacity
            onPress={handleDeletePic}
            disabled={isUpdatingProfilePic}
            className="bg-red-500/10 border border-red-500/30 h-16 rounded-3xl items-center justify-center active:bg-red-500/20"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
              <Text className="text-red-500 font-bold text-lg">Remove Photo</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getHeaderTitle = () => {
    switch (currentView) {
      case "SETTINGS": return "Settings";
      case "PROFILE_PICTURE": return "Photo";
      default: return "Profile";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/60 justify-center items-center px-6"
        onPress={onClose}
      >
        <Pressable
          className="bg-fdm-bg w-full max-w-md rounded-[40px] overflow-hidden border border-white/10 shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header Overlay */}
          <View className="flex-row items-center justify-between px-6 pt-8 pb-4 z-20">
            <TouchableOpacity
              onPress={currentView === "PROFILE" ? onClose : () => setCurrentView("PROFILE")}
              className="w-10 h-10 items-center justify-center rounded-full bg-white/5 active:bg-white/10"
            >
              <Ionicons name={currentView === "PROFILE" ? "close" : "arrow-back"} size={24} color="white" />
            </TouchableOpacity>

            <Text className="text-white text-4xl font-bold tracking-tight">
              {getHeaderTitle()}
            </Text>

            <View className="items-center justify-center">
              <SignOutButton />
            </View>
          </View>

          <View className="relative">
            <BackgroundCircle y={-50} x="80%" color="#CCFF001A" opacity={0.3} size={200} />

            {isBusy && currentView !== "PROFILE_PICTURE" ? (
              <View className="h-64 items-center justify-center">
                <FDMLoader />
              </View>
            ) : (
              <>
                {currentView === "PROFILE" && renderProfileView()}
                {currentView === "SETTINGS" && renderSettingsView()}
                {currentView === "PROFILE_PICTURE" && renderProfilePictureView()}
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ProfileModal;
