import ApprovalGuard from "@components/auth/ApprovalGuard";
import ProfileCard from "@components/profile/ProfileCard";
import ProfilePicModal from "@components/profile/ProfilePicModal";
import SettingsModal from "@components/profile/SettingsModal";
import SignOutButton from "@components/profile/SignOutButton";
import AppTrademark from "@components/ui/AppTrademark";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import FDMLoader from "@components/ui/FDMLoader";
import ScreenHeader from "@components/ui/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@hooks/useAuth";
import { useProfilePicture } from "@hooks/useProfilePicture";
import { useUserSettings } from "@hooks/useUserSettings";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View, useWindowDimensions } from "react-native";

const ProfileScreen = () => {
  const { width, height } = useWindowDimensions();
  const { user } = useAuth();

  // UI State
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isPicModalVisible, setIsPicModalVisible] = useState(false);

  // UI Logic Hooks
  const settings = useUserSettings(isSettingsVisible);
  const {
    isUpdating: isUpdatingProfilePic,
    changeProfilePicture: updateProfilePic,
    deleteProfilePicture: removeProfilePic,
  } = useProfilePicture(user!.userId);

  const isBusy = isUpdatingProfilePic || settings.isSubmittingCityChange;

  if (isBusy) {
    return (
      <View className="flex-1 bg-fdm-bg p-6">
        <FDMLoader />
      </View>
    );
  }

  return (
    <ApprovalGuard>
      <View className="flex-1 bg-fdm-bg px-6">
        <StatusBar style="light" hidden={width > height} />

        <BackgroundCircle y={0} x="80%" color="#CCFF001A" opacity={0.5} />
        <BackgroundCircle y="90%" x={-150} size={500} color="#CCFF00" opacity={0.08} />
        <BackgroundCircle y={400} x="90%" size={600} color="#CCFF00" opacity={0.03} />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            title="Profile"
            rightElement={
              <TouchableOpacity
                className="w-12 h-12 items-center justify-center rounded-2xl bg-white/5 active:bg-white/10 border border-white/5"
                onPress={() => setIsSettingsVisible(true)}
              >
                <Ionicons name="settings-sharp" size={22} color="#ccff00" />
              </TouchableOpacity>
            }
          />

          <ProfileCard
            onPressProfilePicture={() => setIsPicModalVisible(true)}
            isUploadingProfilePicture={isUpdatingProfilePic}
          />

          <View className="p-6 items-center">
            <SignOutButton />
          </View>

          <AppTrademark />
        </ScrollView>

        <SettingsModal
          visible={isSettingsVisible}
          onClose={() => setIsSettingsVisible(false)}
        />
        <ProfilePicModal
          visible={isPicModalVisible}
          onClose={() => setIsPicModalVisible(false)}
          onUpdate={updateProfilePic}
          onRemove={removeProfilePic}
        />
      </View>
    </ApprovalGuard>
  );
};

export default ProfileScreen;