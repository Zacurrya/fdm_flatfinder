import ProfileCard from "@/components/profile/ProfileCard";
import SettingsModal from "@/components/profile/SettingsModal";
import SignOutButton from "@/components/profile/SignOutButton";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const { user } = useAuth();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" />

      {/* Decorative blob */}
      <View className="absolute top-0 right-0 w-64 h-64 bg-fdm-accent/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-16 pb-4 px-6 z-10 flex-row items-center justify-between">
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
        <ProfileCard user={user} />

        {/* Sign Out Button */}
        <View className="items-center mt-8">
          <SignOutButton />
        </View>
      </ScrollView>

      <SettingsModal
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
      />
    </View>
  );
}
