import { Ionicons } from "@expo/vector-icons";
import { useListing } from "@hooks/useListing";
import { formatListingPrice } from "@utils/currency";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";

type ChatListingCardProps = {
  listingId: number;
};

export default function ChatListingCard({ listingId }: ChatListingCardProps) {
  const router = useRouter();
  const { listing, loading, firstPhotoUrl, locationLabel } = useListing(listingId);

  if (loading) {
    return (
      <View className="w-64 h-24 rounded-2xl bg-fdm-fg/5 border border-fdm-fg/10 items-center justify-center">
        <ActivityIndicator size="small" color="#9ca3af" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View className="w-64 rounded-2xl bg-fdm-fg/5 border border-fdm-fg/10 px-4 py-3">
        <Text className="text-fdm-fg/60 text-sm">Listing unavailable</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => router.push(`/listing/${listing.id}` as any)}
      className="w-72 flex-row bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl overflow-hidden active:opacity-70"
    >
      <View className="w-[72px] h-[72px] bg-fdm-fg/10 items-center justify-center overflow-hidden">
        {firstPhotoUrl ? (
          <Image source={{ uri: firstPhotoUrl }} style={{ width: 72, height: 72 }} resizeMode="cover" />
        ) : (
          <Ionicons name="home" size={24} color="#9ca3af66" />
        )}
      </View>

      <View className="flex-1 px-3 py-2 justify-center">
        <Text className="text-fdm-fg font-semibold text-sm" numberOfLines={1}>
          {listing.title}
        </Text>
        <View className="flex-row items-center mt-1 gap-1">
          <Ionicons name="location-outline" size={11} color="#ffffff50" />
          <Text className="text-fdm-fg/50 text-xs flex-1" numberOfLines={1}>
            {locationLabel}
          </Text>
        </View>
      </View>

      <View className="px-3 justify-center items-end border-l border-fdm-fg/10">
        <Text className="text-fdm-fg/80 font-bold text-sm">
          {formatListingPrice(listing.price, (listing as any).rentPeriod)}
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#ffffff20" style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );
}
