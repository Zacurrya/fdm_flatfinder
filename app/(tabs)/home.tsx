import HomeHeader from "@components/home/HomeHeader";
import ApprovalGuard from "@components/ui/ApprovalGuard";
import AppTrademark from "@components/ui/AppTrademark";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import FDMLoader from "@components/ui/FDMLoader";
import ListingCard from "@components/ui/ListingCard";
import { useAuth } from "@hooks/useAuth";
import { useSavedListings } from "@hooks/useSavedListings";
import { fetchListings, Listing } from "@services/listings/listingController";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  const { user } = useAuth();
  const cityName = user?.officeLocation || "home";
  const router = useRouter();
  const { favIds, loadingFavourites, refreshFavourites, toggleFavourite } = useSavedListings();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  const loadListings = useCallback(async () => {
    try {
      setLoadingListings(true);
      const data = await fetchListings();
      setAllListings(data);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      setAllListings([]);
    } finally {
      setLoadingListings(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadListings();
      void refreshFavourites();
    }, [loadListings, refreshFavourites])
  );

  const savedListings = useMemo(
    () => allListings.filter((listing) => favIds.includes(Number(listing.id))),
    [allListings, favIds]
  );

  const loading = loadingListings || loadingFavourites;
  
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
                      await toggleFavourite(Number(listing.id));
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
