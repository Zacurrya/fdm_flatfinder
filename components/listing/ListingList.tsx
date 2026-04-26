import { ListingRecord } from "@/types/records";
import { filterListings } from "@/utils/listingFilters";
import { Ionicons } from "@expo/vector-icons";
import { FilterListingsDTO } from "@services/listings/types";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { Layout } from "react-native-reanimated";
import ListingCard from "./ListingCard";
import ListingCardSkeleton from "../ui/ListingCardSkeleton";

export interface ListingListProps {
  listings: ListingRecord[];
  isLoading: boolean;
  savedListingIds: string[];
  toggleFavourite: (id: string) => void;
  onClearFilters?: () => void;
  emptyMessage?: string;
  filters?: FilterListingsDTO;
}

const ListingList = ({
  listings,
  isLoading,
  savedListingIds,
  toggleFavourite,
  onClearFilters,
  emptyMessage = "No flats found matching your search",
  filters = {}
}: ListingListProps) => {
  const router = useRouter();

  const filteredListings = useMemo(() => {
    return filterListings(listings, { ...filters, savedListingIds } as any);
  }, [listings, filters, savedListingIds]);

  if (isLoading) {
    return (
      <View style={{ paddingVertical: 8 }}>
        <ListingCardSkeleton />
        <ListingCardSkeleton />
      </View>
    );
  }

  // Render empty state if no listings match the filters
  if (filteredListings.length === 0) {
    return (
      <View className="items-center justify-center mt-20">
        <Ionicons name="search-outline" size={64} color="#ffffff20" />
        <Text className="text-fdm-fg/50 text-lg mt-4 font-medium text-center px-10">
          {emptyMessage}
        </Text>
        {onClearFilters && (
          <TouchableOpacity
            onPress={onClearFilters}
            className="mt-6 px-6 py-3 bg-fdm-fg/5 rounded-xl border border-fdm-fg/10"
          >
            <Text className="text-fdm-accent font-bold">Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Render the filtered listings list
  return (
    <ScrollView style={{ marginHorizontal: 0 }} contentContainerStyle={{ paddingVertical: 8 }}>
      {filteredListings.map(listing => (
        <Animated.View
          key={listing.id}
          layout={Layout.springify().damping(85)}
          style={{ width: '100%', paddingVertical: 8 }}
        >
          <ListingCard
            listing={listing}
            isFavourite={savedListingIds.includes(listing.id)}
            onToggleFavourite={() => toggleFavourite(listing.id)}
            onPress={() => router.push(`/listing/${listing.id}`)}
            style={{ width: '100%', alignSelf: 'stretch' }}
          />
        </Animated.View>
      ))}
    </ScrollView>
  );
};

export default ListingList;
