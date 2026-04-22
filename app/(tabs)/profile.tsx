import ProfileCard from "@components/profile/ProfileCard";
import ProfilePicModal from "@components/profile/ProfilePicModal";
import SettingsModal from "@components/profile/SettingsModal";
import SignOutButton from "@components/profile/SignOutButton";
import AppTrademark from "@components/ui/AppTrademark";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import ScreenHeader from "@components/ui/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@hooks/useAuth";
import { useProfilePicture } from "@hooks/useProfilePicture";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

export default function ProfileScreen() {
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  
  // UI State
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isPicModalVisible, setIsPicModalVisible] = useState(false);

  // Isolated Logic Hook
  const { isBusy, handleUpdate, handleRemove } = useProfilePicture();

  return (
    <View className="flex-1 bg-fdm-bg px-6">
      <StatusBar style="light" hidden={width > height} />

      <BackgroundCircle top={0} right={0} color="#CCFF001A" opacity={0.5} />

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
          user={user}
          onPressProfilePicture={() => setIsPicModalVisible(true)}
          isUploadingProfilePicture={isBusy}
        />

        <View className="p-6 items-center">
          <Text className="text-white/50 text-sm text-center mb-6 leading-relaxed">
            You are currently signed in as {user?.email}.
          </Text>
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
        user={user}
        isUploadingProfilePicture={isBusy}
        onClose={() => setIsPicModalVisible(false)}
        onChangeProfilePicture={handleUpdate}
        onRemoveProfilePicture={handleRemove}
      />
    </View>
  );
}