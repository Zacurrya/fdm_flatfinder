import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const insets = useSafeAreaInsets();
  const tabBarTopPadding = 10;
  const tabBarBottomPadding = Math.max(insets.bottom, 12);
  const tabBarContentHeight = 50;
  const iconSizeOffset = 2;
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
          paddingBottom: tabBarBottomPadding * 2.5,
          paddingTop: tabBarTopPadding,
        },
        tabBarActiveTintColor: tabActiveColor,
        tabBarInactiveTintColor: tabInactiveColor,
        tabBarLabelStyle: {
          fontWeight: "600",
          letterSpacing: 0.5,
        },
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
        name="search"
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
        name="messages"
        options={{
          tabBarLabel: "Messages",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={tabIconSize(size)} color={color} />
          ),
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
