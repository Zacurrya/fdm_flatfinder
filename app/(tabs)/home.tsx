import FDMLoader from "@components/ui/FDMLoader";
import HomeHeader from "@components/home/HomeHeader";
import ApprovalGuard from "@components/ui/ApprovalGuard";
import AppTrademark from "@components/ui/AppTrademark";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import ListingCard from "@components/ui/ListingCard";
import { useAuth } from "@context/AuthContext";
import { useListings } from "@hooks/useListings";
import { useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  const { user } = useAuth();
  const cityName = user?.officeLocation || "home";
  const router = useRouter();
  const navigation = useNavigation();

  // Use the centralized useListings hook for data + favorites syncing
  const { allListings, loading, favIds, toggleFavourite, refresh } = useListings();

  // Derived state: only show favorited listings on home
  const savedListings = allListings.filter((l) => favIds.includes(Number(l.id)));

  useEffect(() => {
    // Re-fetch data every time the home tab is pressed
    // @ts-expect-error - expo-router navigation types don't inherently map tab events without explicit typing
    const unsubscribe = navigation.addListener("tabPress", () => {
      refresh();
    });
    return unsubscribe;
  }, [navigation, refresh]);

  return (
    <ApprovalGuard>
      <View className="flex-1 bg-fdm-bg">
        <StatusBar style="light" />
        <BackgroundCircle top={0} right={0} color="#CCFF001A" opacity={0.5} />

        {loading && <FDMLoader />}

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <HomeHeader
            cityName={cityName}
            firstName={user?.firstName}
            officeLocation={user?.officeLocation}
          />

          <View className="px-6 mb-2">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-fdm-fg text-lg font-bold tracking-tight">Saved Listings</Text>
            </View>

            <View className="gap-4">
              {savedListings.length === 0 && !loading ? (
                <Text className="text-fdm-fg/50 text-center py-4">No saved listings yet.</Text>
              ) : (
                savedListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isFavourite={favIds.includes(Number(listing.id))}
                    onToggleFavourite={async () => {
                      await toggleFavourite(listing.id);
                      refresh(); // Refresh home after unfavoriting
                    }}
                    onPress={() => router.push(`/listing/${listing.id}`)}
                  />
                ))
              )}
            </View>
          </View>
          <AppTrademark />
        </ScrollView>
      </View>
    </ApprovalGuard>
  );
}
