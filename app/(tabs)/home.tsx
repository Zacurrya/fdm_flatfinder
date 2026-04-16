import HomeHeader from "@components/home/HomeHeader";
import AwaitingApprovalView from "@components/ui/AwaitingApprovalView";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import ListingCard from "@components/ui/ListingCard";
import { useAuth } from "@context/AuthContext";
import { fetchListings, Listing } from "@services/listings/listingsService";
import { getUserFavourites } from "@services/user/userService";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// Home Screen

// this is the main page that loads the flats from the database
// so the user can browse them on the cards
export default function HomeScreen() {
  const { user } = useAuth();
  const cityName = user?.officeLocation || "home";

  const [listings, setListings] = useState<Listing[]>([]);
  const [favIds, setFavIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const navigation = useNavigation();

  const loadListings = useCallback(async (isActive = true) => {
    try {
      const [data, favResponse] = await Promise.all([
        fetchListings(),
        user?.userId ? getUserFavourites(user.userId) : Promise.resolve({ success: true, data: [] })
      ]);

      if (isActive) {
        const userFavIds = favResponse.success ? favResponse.data || [] : [];
        setFavIds(userFavIds);
        const filtered = data.filter((l) => {
          const isFaved = userFavIds.includes(Number(l.id));
          const listingCity = l.ListingLocations?.city;
          const isSameCity = !!listingCity && !!user?.officeLocation && listingCity.toLowerCase() === user.officeLocation.toLowerCase();
          return isFaved && isSameCity;
        });
        setListings(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      if (isActive) {
        setLoading(false);
      }
    }
  }, [user?.userId]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      loadListings(isActive);
      return () => { isActive = false; };
    }, [loadListings])
  );

  useEffect(() => {
    // @ts-expect-error - expo-router navigation types don't inherently map tab events without explicit typing
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      // Re-fetch data every time the home tab is pressed
      setLoading(true);
      loadListings(true);
    });

    return unsubscribe;
  }, [navigation, loadListings]);

  if (user?.approvalStatus === "PENDING" || user?.approvalStatus === "REJECTED") {
    return (
      <AwaitingApprovalView
        title={user.approvalStatus === "REJECTED" ? "Account Denied" : "Awaiting Admin Approval"}
        message={
          user.approvalStatus === "REJECTED"
            ? "Your account has been denied. Please contact an administrator for more information."
            : "Your account is awaiting admin approval."
        }
      />
    );
  }

  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" />

      <BackgroundCircle top={0} right={0} color="#CCFF001A" opacity={0.5} />

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

        {/* Featured Listings */}
        <View className="px-6 mb-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-fdm-fg text-lg font-bold tracking-tight">Saved Listings</Text>
            <TouchableOpacity>
              <Text className="text-fdm-accent text-sm font-semibold">See all</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-4">
            {loading ? (
              <Text className="text-fdm-fg/50 text-center py-4">Loading listings...</Text>
            ) : listings.length === 0 ? (
              <Text className="text-fdm-fg/50 text-center py-4">No saved listings yet.</Text>
            ) : (
              listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavourite={favIds.includes(Number(listing.id))}
                  onToggleFavourite={async () => {
                    const lId = Number(listing.id);
                    if (!user) return;

                    const isFaved = favIds.includes(lId);

                    if (isFaved) {
                      // Optimistically update UI instantly
                      setFavIds(prev => prev.filter(id => id !== lId));
                      setListings(prev => prev.filter(l => Number(l.id) !== lId));
                      
                      const { removeFavourite } = await import("../../services/user/userService");
                      const res = await removeFavourite(user.userId, lId);
                      
                      if (!res.success) {
                         console.error("Unfavourite failed on Home:", res.error);
                      }
                      
                      // Explicitly refresh the entire home page as requested
                      setLoading(true);
                      loadListings(true);
                    }
                  }}
                  onPress={() => router.push(`/listing/${listing.id}`)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
