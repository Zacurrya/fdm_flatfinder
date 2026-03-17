import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const QUICK_ACTIONS = [
  { icon: "search-outline", label: "Search" },
  { icon: "map-outline", label: "Map View" },
  { icon: "filter-outline", label: "Filters" },
  { icon: "notifications-outline", label: "Alerts" },
] as const;

const PLACEHOLDER_LISTINGS = [
  { id: 1, title: "Modern Studio", location: "Canary Wharf, London", price: "£1,850/mo", beds: 1, baths: 1 },
  { id: 2, title: "2-Bed Apartment", location: "Manchester City Centre", price: "£1,200/mo", beds: 2, baths: 1 },
  { id: 3, title: "Shared House Room", location: "Leeds, West Yorkshire", price: "£650/mo", beds: 1, baths: 2 },
];

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" />

      {/* Decorative blobs */}
      <View className="absolute top-0 right-0 w-64 h-64 bg-fdm-accent/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <View className="pt-16 pb-4 px-6 z-10">
          <View className="flex-row items-center justify-between mb-1">
            <Image
              source={require("../../assets/images/logo.svg")}
              style={{ width: 120, height: 20 }}
              contentFit="contain"
              tintColor="#ccff00"
            />
            <TouchableOpacity className="w-10 h-10 rounded-full bg-fdm-fg/10 border border-fdm-fg/10 items-center justify-center">
              <Ionicons name="notifications-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text className="text-fdm-fg text-2xl tracking-tighter mt-4" style={{ fontFamily: "Michroma_400Regular" }}>
            Find your <Text className="text-fdm-accent">home</Text>
          </Text>
          <Text className="text-fdm-fg/50 text-sm mt-1">Welcome back 👋</Text>
        </View>

        {/* ── Quick Actions ───────────────────────────────────────── */}
        <View className="flex-row px-6 gap-3 mt-2 mb-6">
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              className="flex-1 bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl py-4 items-center gap-1 active:bg-fdm-fg/10"
            >
              <Ionicons name={action.icon} size={22} color="#ccff00" />
              <Text className="text-fdm-fg/70 text-xs font-medium">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Featured Listings ───────────────────────────────────── */}
        <View className="px-6 mb-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-fdm-fg text-lg font-bold tracking-tight">Nearby Listings</Text>
            <TouchableOpacity>
              <Text className="text-fdm-accent text-sm font-semibold">See all</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-4">
            {PLACEHOLDER_LISTINGS.map((listing) => (
              <TouchableOpacity
                key={listing.id}
                className="bg-fdm-fg/5 border border-fdm-fg/10 rounded-3xl overflow-hidden active:opacity-80"
              >
                {/* Placeholder image band */}
                <View className="h-40 bg-fdm-fg/10 items-center justify-center">
                  <Ionicons name="home" size={40} color="#ccff0030" />
                </View>

                <View className="p-4">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-fdm-fg font-bold text-base">{listing.title}</Text>
                      <View className="flex-row items-center mt-1 gap-1">
                        <Ionicons name="location-outline" size={13} color="#ffffff60" />
                        <Text className="text-fdm-fg/50 text-xs">{listing.location}</Text>
                      </View>
                    </View>
                    <View className="bg-fdm-accent/10 border border-fdm-accent/20 px-3 py-1 rounded-xl">
                      <Text className="text-fdm-accent font-bold text-sm">{listing.price}</Text>
                    </View>
                  </View>

                  <View className="flex-row gap-4 mt-3 pt-3 border-t border-fdm-fg/10">
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="bed-outline" size={14} color="#ffffff50" />
                      <Text className="text-fdm-fg/50 text-xs">{listing.beds} bed</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="water-outline" size={14} color="#ffffff50" />
                      <Text className="text-fdm-fg/50 text-xs">{listing.baths} bath</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="people-outline" size={14} color="#ffffff50" />
                      <Text className="text-fdm-fg/50 text-xs">FDMers nearby</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
