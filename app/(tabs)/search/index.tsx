import FilterSidebar from "@components/search/FilterSidebar";
import SearchBar from "@components/search/SearchBar";
import AwaitingApprovalView from "@components/ui/AwaitingApprovalView";
import ListingCard from "@components/ui/ListingCard";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { fetchListings, Listing } from "@services/listings/listingController";
import { addFavourite, getUserFavourites, removeFavourite } from "@services/user/userController";
import { filterListings } from "@utils/listingFilters";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

export default function SearchScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [listings, setListings] = useState<Listing[]>([]);
  const [favIds, setFavIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [bathrooms, setBathrooms] = useState<number | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Caches listings & favourites on screen focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadListings = async () => {
        try {
          const [data, favData] = await Promise.all([
            fetchListings(),
            user?.userId ? getUserFavourites(user.userId) : Promise.resolve({ success: true, data: [] })
          ]);
          if (isActive) {
            setListings(data);
            setFavIds(favData.success ? favData.data || [] : []);
          }
        } catch (error) {
          console.error("Failed to fetch listings:", error);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      
      setLoading(true);
      loadListings();
      
      return () => { isActive = false; };
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

  const filteredListings = filterListings(listings, {
    searchQuery,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    sourceFilter,
  });

  const sidebarProps = {
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    bedrooms, setBedrooms,
    bathrooms, setBathrooms,
    sourceFilter, setSourceFilter,
  };

  const renderSidebar = () => (
    <View className="w-80 bg-[#151515] border-r border-[#ffffff10] h-full">
      <FilterSidebar {...sidebarProps} />
    </View>
  );

  return (
    <View className="flex-1 bg-fdm-bg">
      <View className="flex-1 flex-row pt-8">
        {/* Landscape Sidebar */}
        {isLandscape && renderSidebar()}

        {/* Main Content */}
        <View className="flex-1">
          {/* Header */}
          <View className={`px-6 py-4 border-b border-fdm-fg/10 ${!isLandscape ? 'pt-8' : ''}`}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              showFilterButton={!isLandscape}
              onPressFilter={() => setShowMobileSidebar(true)}
            />
          </View>

          {/* Results list */}
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
            {loading ? (
              <ActivityIndicator color="#ccff00" size="large" className="mt-10" />
            ) : filteredListings.length === 0 ? (
              <View className="items-center justify-center mt-20">
                <Ionicons name="search-outline" size={64} color="#ffffff20" />
                <Text className="text-fdm-fg/50 text-lg mt-4 font-medium text-center">No flats found matching your search</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setMinPrice(""); setMaxPrice(""); setBedrooms(null); setBathrooms(null); setSourceFilter(null); setSearchQuery("");
                  }} 
                  className="mt-6 px-6 py-3 bg-fdm-fg/5 rounded-xl border border-fdm-fg/10"
                >
                  <Text className="text-fdm-accent font-bold">Clear Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flexDirection: isLandscape ? 'row' : 'column', flexWrap: 'wrap', marginHorizontal: -8 }}>
                {filteredListings.map(listing => (
                  <View key={listing.id} style={{ width: isLandscape ? '50%' : '100%', padding: 8 }}>
                    <ListingCard 
                      listing={listing} 
                      isFavourite={favIds.includes(Number(listing.id))}
                      onToggleFavourite={async () => {
                        if (!user) return;
                        const lId = Number(listing.id);
                        const isFaved = favIds.includes(lId);
                        
                        if (isFaved) {
                            setFavIds(prev => prev.filter(id => id !== lId));
                            const res = await removeFavourite(user.userId, lId);
                            if (!res.success) {
                                console.error("Unfavourite failed:", res.error);
                                setFavIds(prev => [...prev, lId]); // rollback
                            }
                        } else {
                            setFavIds(prev => [...prev, lId]);
                            const res = await addFavourite(user.userId, lId);
                            if (!res.success) {
                                console.error("Favourite failed:", res.error);
                                setFavIds(prev => prev.filter(id => id !== lId)); // rollback
                            }
                        }
                      }}
                      onPress={() => router.push(`/listing/${listing.id}`)}
                    />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Mobile Modal Sidebar */}
      {!isLandscape && (
        <Modal
          visible={showMobileSidebar}
          animationType="slide"
          presentationStyle="formSheet"
          onRequestClose={() => setShowMobileSidebar(false)}
        >
          <View className="flex-1 bg-fdm-bg pt-8">
            <FilterSidebar 
              {...sidebarProps} 
              onClose={() => setShowMobileSidebar(false)} 
            />
          </View>
        </Modal>
      )}
    </View>
  );
}
