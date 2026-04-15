}
import HomeHeader from "@components/home/HomeHeader";
import AwaitingApprovalView from "@components/ui/AwaitingApprovalView";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import ListingCard, { ListingCardData } from "@components/ui/ListingCard";
import { useAuth } from "@context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { fetchListings, Listing } from "../../services/listings/listingsService";

// Home Screen

// this is the main page that loads the flats from the database
// so the user can browse them on the cards
export default function HomeScreen() {
  const { user } = useAuth();
  const cityName = user?.officeLocation || "home";

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadListings = async () => {
        try {
          const data = await fetchListings();
          if (isActive) {
            setListings(data);
          }
        } catch (error) {
          console.error("Failed to fetch listings:", error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      loadListings();

      return () => {
        isActive = false;
      };
    }, [])
  );

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
            <Text className="text-fdm-fg text-lg font-bold tracking-tight">Featured/Favourited Listings (Undecided)</Text>
            <TouchableOpacity>
              <Text className="text-fdm-accent text-sm font-semibold">See all</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-4">
            {loading ? (
              <Text className="text-fdm-fg/50 text-center py-4">Loading listings...</Text>
            ) : listings.length === 0 ? (
              <Text className="text-fdm-fg/50 text-center py-4">No listings found. Be the first to add one!</Text>
            ) : (
              listings.map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
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
