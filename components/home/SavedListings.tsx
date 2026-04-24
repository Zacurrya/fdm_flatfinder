import { Listing } from "@/types/views";
import SavedListingCard from "@components/home/SavedListingCard";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

type SavedListingsProps = {
  savedListings: Listing[];
  onPressListing: (id: string | number) => void;
};

const SavedListings = ({ savedListings, onPressListing }: SavedListingsProps) => {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between px-6 mb-4">
        <Text className="text-fdm-fg text-lg font-bold">Saved Listings</Text>
        {savedListings.length > 0 && (
          <Text className="text-fdm-fg/50 text-sm">{savedListings.length} saved</Text>
        )}
      </View>

      {savedListings.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {savedListings.map((listing) => (
            <SavedListingCard
              key={listing.id}
              listing={listing}
              onPress={() => onPressListing(listing.id)}
            />
          ))}
        </ScrollView>
      ) : (
        <View className="mx-6 p-8 rounded-3xl items-center justify-center" style={{ marginTop: 100 }}>
          <Ionicons name="bookmark-outline" size={48} color="#ffffff30" />
          <Text className="text-fdm-fg/40 text-md mt-2 text-center">
            Your saved listings will appear here.
          </Text>
        </View>
      )}
    </View>
  );
};

export default SavedListings;
