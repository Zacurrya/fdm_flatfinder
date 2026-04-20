import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const tabBarTopPadding = isLandscape ? 6 : 10;
  const tabBarBottomPadding = Math.max(insets.bottom, isLandscape ? 8 : 12);
  const tabBarContentHeight = isLandscape ? 40 : 50;
  const iconSizeOffset = isLandscape ? 0 : 2;
  const tabIconSize = (size?: number) => (size ?? 24) + iconSizeOffset;
  const tabBackgroundColor = "#222222";
  const tabBorderColor = "#ffffff15";
  const tabActiveColor = "#ccff00";
  const tabInactiveColor = "#ffffff50";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBackgroundColor,
          borderTopColor: tabBorderColor,
          borderTopWidth: 1,
          height: tabBarContentHeight + tabBarTopPadding + tabBarBottomPadding,
          paddingBottom: tabBarBottomPadding,
          paddingTop: tabBarTopPadding,
        },
        tabBarActiveTintColor: tabActiveColor,
        tabBarInactiveTintColor: tabInactiveColor,
        tabBarLabelStyle: {
          fontWeight: "600",
          fontSize: isLandscape ? 10 : 12,
          letterSpacing: 0.5,
        },
        tabBarShowLabel: isLandscape,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={tabIconSize(size)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add_listing"
        options={{
          tabBarLabel: "Add",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={tabIconSize(size)} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search/index"
        options={{
          tabBarLabel: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={tabIconSize(size)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="messages/index"
        options={{
          tabBarLabel: "Messages",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={tabIconSize(size)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages/[conversationId]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          tabBarLabel: "Admin",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={tabIconSize(size)} color={color} />
          ),
          // Hide the admin tab for non-admin users
          href: isAdmin ? ("/(tabs)/admin" as any) : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={tabIconSize(size)} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
