import { Ionicons } from "@expo/vector-icons";
import { fetchListingById, Listing } from "@services/listings/listingController";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { formatCurrencyWithSymbol } from "@/utils/currency";

type ChatListingCardProps = {
  listingId: number;
};

function getFirstPhotoUrl(photos: string[] | null | undefined): string | null {
  if (!photos || photos.length === 0) {
    return null;
  }

  const valid = photos.map((url) => url.trim()).filter((url) => url.startsWith("http"));
  return valid[0] ?? null;
}

function getRentLabel(period: string | null | undefined): string {
  if (period === "WEEKLY") return "pw";
  if (period === "BIWEEKLY") return "biwk";
  return "pcm";
}

export default function ChatListingCard({ listingId }: ChatListingCardProps) {
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchListingById({ id: listingId });
        if (active) {
          setListing(data);
        }
      } catch {
        if (active) {
          setListing(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [listingId]);

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

  const listingPhoto = getFirstPhotoUrl(Array.isArray(listing.photos) ? listing.photos : null);
  const locationLabel = listing.ListingLocations?.address ?? listing.ListingLocations?.city ?? "Location unavailable";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/listing/${listing.id}` as any)}
      className="w-72 flex-row bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl overflow-hidden active:opacity-70"
    >
      <View className="w-[72px] h-[72px] bg-fdm-fg/10 items-center justify-center overflow-hidden">
        {listingPhoto ? (
          <Image source={{ uri: listingPhoto }} style={{ width: 72, height: 72 }} resizeMode="cover" />
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
        <Text className="text-fdm-fg/80 font-bold text-sm">{formatCurrencyWithSymbol(listing.price)}</Text>
        <Text className="text-fdm-fg/40 text-xs">{getRentLabel(listing.rentPeriod)}</Text>
        <Ionicons name="chevron-forward" size={14} color="#ffffff20" style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );
}
