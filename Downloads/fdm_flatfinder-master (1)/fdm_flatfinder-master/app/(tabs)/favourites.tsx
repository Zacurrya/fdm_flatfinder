import AwaitingApprovalView from "@components/ui/AwaitingApprovalView";
import ListingCard from "@components/ui/ListingCard";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { fetchFavourites } from "../../services/listings/favouritesService";
import { Listing } from "../../services/listings/listingsService";

export default function FavouritesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [favourites, setFavourites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user?.userId) return;
      let active = true;

      const load = async () => {
        setLoading(true);
        try {
          const data = await fetchFavourites(user.userId);
          if (active) setFavourites(data);
        } catch (e) {
          console.error("Failed to load favourites:", e);
        } finally {
          if (active) setLoading(false);
        }
      };

      load();
      return () => { active = false; };
    }, [user?.userId])
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

      <View className="pt-14 pb-4 px-6">
        <Text className="text-fdm-fg text-3xl font-bold tracking-tight">Favourites</Text>
        <Text className="text-fdm-fg/40 text-sm mt-1">Listings you've saved</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ccff00" />
        </View>
      ) : favourites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="heart-outline" size={56} color="#ffffff15" />
          <Text className="text-fdm-fg/40 text-base text-center mt-4">No favourites yet.</Text>
          <Text className="text-fdm-fg/25 text-sm text-center mt-1">
            Tap the heart on any listing to save it here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className="gap-4">
            {favourites.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onPress={() => router.push(`/listing/${listing.id}`)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
