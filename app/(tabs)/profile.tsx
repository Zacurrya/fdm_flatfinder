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
        <View className="px-6 mt-4">
          <View className="bg-fdm-fg/5 border border-fdm-fg/10 rounded-3xl p-6">
            {/* Avatar + Name */}
            <View className="flex-row items-center gap-4 mb-6">
              <View className="w-16 h-16 rounded-full bg-fdm-accent/15 border border-fdm-accent/20 items-center justify-center">
                <Text className="text-fdm-accent font-bold text-xl">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </Text>
              </View>
              <View>
                <Text className="text-fdm-fg font-bold text-lg">
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text className="text-fdm-fg/50 text-sm mt-0.5">
                  {user?.role === "ADMIN" ? "Administrator" : "Consultant"}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View className="gap-4">
              <View className="flex-row items-center gap-3">
                <Ionicons name="mail-outline" size={18} color="#ffffff60" />
                <Text className="text-fdm-fg/70 text-sm">{user?.email || "—"}</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Ionicons name="call-outline" size={18} color="#ffffff60" />
                <Text className="text-fdm-fg/70 text-sm">{user?.phoneNumber || "—"}</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Ionicons name="location-outline" size={18} color="#ffffff60" />
                <Text className="text-fdm-fg/70 text-sm">{user?.officeLocation || "—"}</Text>
              </View>
            </View>
          </View>
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
    </View>
  );
}
