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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#222222",
          borderTopColor: "#ffffff15",
          borderTopWidth: 1,
          height: tabBarContentHeight + tabBarTopPadding + tabBarBottomPadding,
          paddingBottom: tabBarBottomPadding * 2.5,
          paddingTop: tabBarTopPadding,
        },
        tabBarActiveTintColor: "#ccff00",
        tabBarInactiveTintColor: "#ffffff50",
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
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarLabel: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
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
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          tabBarLabel: "Admin",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
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
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
