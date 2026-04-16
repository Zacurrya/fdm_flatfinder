import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { fetchListingById, deleteListing, Listing, getSignedListingPhotoUrl } from "../../services/listings/listingsService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@context/AuthContext";
import { getOrCreateConversation } from "../../services/chat/chatService";
import { isFavourited, addFavourite, removeFavourite } from "../../services/listings/favouritesService";

// listing detail screen

// opens up a single listing so the user can see all the details
// also lets the owner delete their own listing
export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [favourited, setFavourited] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  const [signedPhotos, setSignedPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    
    // load the listing data when the page opens
    const loadData = async () => {
      try {
        const data = await fetchListingById(Number(id));
        setListing(data);

        if (user?.userId) {
          const fav = await isFavourited(user.userId, Number(id));
          setFavourited(fav);
        }
        
        // make sure urls work and get signed ones if the bucket is private
        let rawPhotos: string[] = [];
        if (data.photos) {
            if (Array.isArray(data.photos)) {
                rawPhotos = data.photos;
            } else if (typeof data.photos === 'string') {
                try {
                    rawPhotos = JSON.parse(data.photos);
                } catch (e) {
                    const matches = (data.photos as string).match(/https?:\/\/[^,}\]]+/g);
                    if (matches) rawPhotos = matches;
                }
            }
        }
        
        const cleaned = rawPhotos
            .map(url => url ? url.replace(/^"|"$/g, '').trim() : '')
            .filter(url => url.startsWith('http'));

        if (cleaned.length > 0) {
            const signed = await Promise.all(cleaned.map(url => getSignedListingPhotoUrl(url)));
            setSignedPhotos(signed);
        }
      } catch (err) {
        console.error("Failed to fetch flat details", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-fdm-bg items-center justify-center">
        <ActivityIndicator size="large" color="#ccff00" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View className="flex-1 bg-fdm-bg items-center justify-center relative">
        <TouchableOpacity 
          className="absolute top-12 left-6 h-10 w-10 bg-fdm-fg/10 rounded-full items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white">Listing not found</Text>
      </View>
    );
  }

  // format the price with the pound sign
  const formatPrice = (price: number | string) => {
    return `£${price}`;
  };

  // convert rent period to a short label for display
  const getRentLabel = (period: string | undefined): string => {
    if (period === "WEEKLY") return "pw";
    if (period === "BIWEEKLY") return "biwk";
    if (period === "MONTHLY") return "pcm";
    return "pw";
  };

  const windowWidth = Dimensions.get('window').width;

  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" />
      
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

          {/* favourite button */}
          {user?.userId && (
            <TouchableOpacity
              className="absolute right-6 h-12 w-12 bg-black/40 rounded-full items-center justify-center border border-white/10"
              style={{ top: insets.top || 48 }}
              onPress={async () => {
                if (!user?.userId || !listing) return;
                setTogglingFav(true);
                try {
                  if (favourited) {
                    await removeFavourite(user.userId, listing.id as number);
                    setFavourited(false);
                  } else {
                    await addFavourite(user.userId, listing.id as number);
                    setFavourited(true);
                  }
                } catch {
                  Alert.alert("Error", "Could not update favourite.");
                } finally {
                  setTogglingFav(false);
                }
              }}
              disabled={togglingFav}
            >
              <Ionicons
                name={favourited ? "heart" : "heart-outline"}
                size={22}
                color={favourited ? "#ef4444" : "white"}
              />
            </TouchableOpacity>
          )}
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
                {formatPrice(listing.price)}<Text className="text-sm font-medium">/{getRentLabel(listing.rentPeriod)}</Text>
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-6">
            <Ionicons name="location" size={16} color="#ffffff60" />
            <Text className="text-fdm-fg/60 text-base ml-1">{listing.location}</Text>
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
          
          {user?.userId !== listing.userId && (
            <TouchableOpacity
              onPress={async () => {
                if (!user?.userId) return;
                try {
                  const { getOrCreateConversation: getConv, sendMessage } = await import("../../services/chat/chatService");
                  const conv = await getConv(
                    user.userId,
                    listing.userId,
                    listing.id as number
                  );
                  // send an intro message the first time this conversation is created
                  const { getMessages } = await import("../../services/chat/chatService");
                  const existing = await getMessages(conv.id);
                  if (existing.length === 0) {
                    const label = `${getRentLabel(listing.rentPeriod)}`;
                    await sendMessage(
                      conv.id,
                      user.userId,
                      `Hi! I'm interested in your listing: "${listing.title}" — £${listing.price}/${label} in ${listing.location}.`
                    );
                  }
                  router.push(`/(tabs)/messages/${conv.id}` as any);
                } catch (e) {
                  Alert.alert("Error", "Could not open chat. Please try again.");
                }
              }}
              className="bg-fdm-accent py-4 rounded-2xl flex-row justify-center items-center mt-2"
            >
              <Ionicons name="chatbubble-outline" size={20} color="#1a1a1a" />
              <Text className="text-fdm-bg font-bold ml-2">Message Seller</Text>
            </TouchableOpacity>
          )}

          {user?.userId === listing.userId && (
            <TouchableOpacity
               onPress={async () => {
                  try {
                    await deleteListing(listing.id as number);
                    router.back();
                  } catch (e) {
                    console.error("Failed to delete", e);
                  }
               }}
               className="bg-red-500/20 py-4 rounded-2xl flex-row justify-center items-center mt-2 border border-red-500/30"
            >
               <Ionicons name="trash-outline" size={20} color="#ef4444" className="mr-2" />
               <Text className="text-red-500 font-bold ml-2">Delete My Listing</Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </View>
  );
}
