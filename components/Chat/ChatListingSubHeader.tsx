import { Listing } from "@/types/views";
import { Ionicons } from "@expo/vector-icons";
import { useListing } from "@hooks/listings/useListing";
import { formatListingPrice } from "@utils/currency";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

type ChatListingSubHeaderProps = {
  listingId?: string;
  initialData?: Listing | null;
};

const ChatListingSubHeader = ({
  listingId,
  initialData
}: ChatListingSubHeaderProps) => {
  const router = useRouter();
  const { listing, listingSold, firstPhotoUrl, isLoading, locationLabel } = useListing(listingId, initialData);

  if (isLoading) return null;

  if (listingSold && !listing) {
    return (
      <View className="mx-4 mt-3 flex-row bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl overflow-hidden opacity-80">
        <View className="w-[72px] h-[72px] bg-fdm-fg/10 items-center justify-center overflow-hidden">
          <Ionicons name="home" size={26} color="#ffffff35" />
        </View>

        <View className="flex-1 px-3 py-2 justify-center">
          <Text className="text-fdm-fg font-semibold text-sm" numberOfLines={1}>
            Listing sold
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="close-circle-outline" size={11} color="#ffffff50" />
            <Text className="text-fdm-fg/50 text-xs flex-1" numberOfLines={1}>
              This flat is no longer available.
            </Text>
          </View>
          <View className="flex-row items-center mt-1 gap-1">
            <Ionicons name="alert-circle-outline" size={11} color="#ffffff40" />
            <Text className="text-fdm-fg/60 text-xs">View listing</Text>
          </View>
        </View>

        <View className="px-3 justify-center items-end border-l border-fdm-fg/10">
          <Text className="text-fdm-fg/60 font-bold text-base">Sold</Text>
          <Ionicons name="chevron-forward" size={14} color="#ffffff20" style={{ marginTop: 4 }} />
        </View>
      </View>
    );
  }

  if (!listing) return null;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/listing/${listing.id}` as any)}
      className="mx-4 mt-3 flex-row bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl overflow-hidden active:opacity-70"
    >
      <View className="w-[72px] h-[72px] bg-fdm-fg/10 items-center justify-center overflow-hidden">
        {firstPhotoUrl ? (
          <Image
            source={{ uri: firstPhotoUrl }}
            style={{ width: 72, height: 72 }}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="home" size={26} color="#ccff0040" />
        )}
      </View>

      <View className="flex-1 px-3 py-2 justify-center">
        <Text className="text-fdm-fg font-semibold text-sm" numberOfLines={1}>
          {listing.title}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="location-outline" size={11} color="#ffffff50" />
          <Text className="text-fdm-fg/50 text-xs flex-1" numberOfLines={1}>
            {locationLabel}
          </Text>
        </View>
        <View className="flex-row items-center mt-1 gap-1">
          <Ionicons name="home-outline" size={11} color="#ccff0060" />
          <Text className="text-fdm-accent/70 text-xs">View listing</Text>
        </View>
      </View>

      <View className="px-3 justify-center items-end border-l border-fdm-fg/10">
        <Text className="text-fdm-accent font-bold text-base">
          {formatListingPrice(listing.price, listing.rentPeriod)}
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#ffffff20" style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );
};

export default ChatListingSubHeader;
