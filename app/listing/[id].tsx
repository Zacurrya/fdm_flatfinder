import FavouriteListingButton from "@components/listing/FavouriteListingButton";
import IconButton from "@components/listing/IconButton";
import FDMLoader from "@components/ui/FDMLoader";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@hooks/useAuth";
import { useListing } from "@hooks/useListing";
import { useSavedListings } from "@hooks/useSavedListings";
import { formatListingPrice } from "@utils/currency";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { favIds, toggleFavourite } = useSavedListings();

  const {
    listing,
    loading,
    signedPhotos,
    actions,
    isOwner,
  } = useListing(id as string);

  const listingId = listing ? Number(listing.id) : null;
  const isFavourite = listingId != null && favIds.includes(listingId);

  const windowWidth = Dimensions.get('window').width;
  const buttonSize = 28;

  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" />
      {loading && <FDMLoader />}

      {!loading && !listing && (
        <View className="flex-1 bg-fdm-bg items-center justify-center relative">
          <TouchableOpacity
            className="absolute top-12 left-6 h-10 w-10 bg-fdm-fg/10 rounded-full items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-white">Listing not found</Text>
        </View>
      )}

      {listing && (
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {/* photo header */}
          <View className="w-full h-80 bg-fdm-fg/10 relative">
            {signedPhotos.length > 0 ? (
              <>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={{ width: '100%', height: 320 }}
                >
                  {signedPhotos.map((url, index) => (
                    <View key={index} style={{ width: windowWidth, height: 320 }}>
                      <Image
                        key={url}
                        source={{ uri: url }}
                        style={{ width: windowWidth, height: 320 }}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </ScrollView>
                {signedPhotos.length > 1 && (
                  <View className="absolute bottom-4 w-full flex-row justify-center items-center gap-2 pointer-events-none">
                    {signedPhotos.map((_, idx) => (
                      <View key={idx} className="w-2 h-2 rounded-full bg-white/70" />
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="home" size={60} color="#ccff0030" />
              </View>
            )}

            {/* back button overlay */}
            <TouchableOpacity
              className="absolute left-6 h-12 w-12 bg-black/40 rounded-full items-center justify-center backdrop-blur-md border border-white/10"
              style={{ top: insets.top || 48 }}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            {/* Action buttons overlay */}
            <View 
              className="absolute right-6 flex-row items-center gap-3" 
              style={{ top: insets.top || 48 }}
            >
              {/* -- Favourite listing button -- */}
              {user?.userId && listingId != null && (
                <FavouriteListingButton
                  isFavourite={isFavourite}
                  size={buttonSize}
                  toggleFavourite={() => toggleFavourite(listingId)}
                />
              )}
              {/* -- Share listing button -- */}
              {user?.userId && (
                <IconButton
                  iconName="share-social-outline"
                  onPress={actions.shareToGroupChat} 
                  size={buttonSize}
                />
              )}
              {/* -- Delete listing button -- */}
              {isOwner && (
                <IconButton
                  iconName="trash-outline"
                  iconColor="#ef4444"
                  size={28}
                  onPress={actions.deleteListing}   // wraps the Alert confirmation
                  disabled={loading}
                />
              )}
            </View>
          </View>

          {/* content body */}
          <View className="px-6 pt-6 pb-20">

            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-4">
                <Text className="text-white text-3xl font-bold tracking-tight">
                  {listing.title}
                </Text>
              </View>
              <View className="bg-fdm-accent/20 px-4 py-2 rounded-full border border-fdm-accent/30 shadow-lg shadow-fdm-accent/20">
                <Text className="text-fdm-accent font-bold text-lg">
                  {formatListingPrice(listing.price, listing.rentPeriod)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-6">
              <Ionicons name="location" size={16} color="#ffffff60" />
              <Text className="text-fdm-fg/60 text-base ml-1">{listing.ListingLocations?.address || "Address unavailable"}</Text>
            </View>

            <View className="flex-row border-y border-white/10 py-5 mb-8 justify-around">
              <View className="items-center">
                <Ionicons name="bed-outline" size={24} color="#ccff00" />
                <Text className="text-white font-semibold mt-2">{listing.beds || 1} Bed</Text>
              </View>
              <View className="h-full w-[1px] bg-white/10" />
              <View className="items-center">
                <Ionicons name="water-outline" size={24} color="#ccff00" />
                <Text className="text-white font-semibold mt-2">{listing.baths || 1} Bath</Text>
              </View>
              <View className="h-full w-[1px] bg-white/10" />
              <View className="items-center">
                <Ionicons name="business-outline" size={24} color="#ccff00" />
                <Text className="text-white font-semibold mt-2 truncate w-20 text-center">
                  {listing.propertyType ? listing.propertyType.charAt(0).toUpperCase() + listing.propertyType.slice(1).toLowerCase() : "Flat"}
                </Text>
              </View>
            </View>

            {listing.description ? (
              <View className="mb-6">
                <Text className="text-white text-lg font-bold mb-2">Description</Text>
                <Text className="text-fdm-fg/80 text-base leading-relaxed">
                  {listing.description}
                </Text>
              </View>
            ) : null}

            {!isOwner && (
              <TouchableOpacity
                onPress={actions.openChat}
                className="bg-fdm-accent py-4 mx-12 rounded-2xl flex-row justify-center items-center mt-2"
              >
                <Ionicons name="chatbubble-outline" size={20} color="#1a1a1a" />
                <Text className="text-fdm-bg font-bold px-10">Message Seller</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
