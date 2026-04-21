import BackgroundCircle from "@components/ui/BackgroundCircle";
import FilterSidebar from "@components/search/FilterSidebar";
import SearchBar from "@components/search/SearchBar";
import ApprovalGuard from "@components/ui/ApprovalGuard";
import FDMLoader from "@components/ui/FDMLoader";
import ListingCard from "@components/ui/ListingCard";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useListings } from "@hooks/useListings";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Modal, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

export default function SearchScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Props from useListings hook
  const {
    listings,
    favIds,
    loading,
    toggleFavourite,
    filters,
    setMinPrice,
    setMaxPrice,
    setBedrooms,
    setBathrooms,
    setSourceFilter,
    setSearchQuery,
    clearAllFilters,
  } = useListings();

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;

  // -- Sidebar Animation Logic --
  useEffect(() => {
    if (showMobileSidebar) {
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [showMobileSidebar, width, slideAnim]);

  const sidebarProps = {
    ...filters,
    setMinPrice,
    setMaxPrice,
    setBedrooms,
    setBathrooms,
    setSourceFilter,
    onClearAll: clearAllFilters,
  };

  const renderSidebar = (onClose?: () => void) => (
    <View className={`${isLandscape ? 'w-80' : 'w-full'} bg-fdm-bg border-l border-[#ffffff10] h-full shadow-2xl`}>
      <FilterSidebar
        {...sidebarProps}
        onClose={onClose}
      />
    </View>
  );

  return (
    <ApprovalGuard>
      <View className="flex-1 bg-fdm-bg">
        <BackgroundCircle top={0} right={0} color="#CCFF001A" opacity={0.5} />
      {loading && <FDMLoader />}
      <View className="flex-1 flex-row">
        {/* Landscape Sidebar */}
        {isLandscape && renderSidebar()}

        {/* Main Content */}
        <View className="flex-1">
          {/* Header */}
          <View className={`px-6 py-4 border-b border-fdm-fg/10 ${!isLandscape ? 'pt-12' : 'pt-8'}`}>
            <SearchBar
              value={filters.searchQuery}
              onChangeText={setSearchQuery}
              showFilterButton={!isLandscape}
              onPressFilter={() => setShowMobileSidebar(true)}
            />
          </View>

          {/* Results list */}
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
            {listings.length === 0 && !loading ? (
              <View className="items-center justify-center mt-20">
                <Ionicons name="search-outline" size={64} color="#ffffff20" />
                <Text className="text-fdm-fg/50 text-lg mt-4 font-medium text-center">No flats found matching your search</Text>
                <TouchableOpacity
                  onPress={clearAllFilters}
                  className="mt-6 px-6 py-3 bg-fdm-fg/5 rounded-xl border border-fdm-fg/10"
                >
                  <Text className="text-fdm-accent font-bold">Clear Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flexDirection: isLandscape ? 'row' : 'column', flexWrap: 'wrap', marginHorizontal: -8 }}>
                {listings.map(listing => (
                  <View key={listing.id} style={{ width: isLandscape ? '50%' : '100%', padding: 8 }}>
                    <ListingCard
                      listing={listing}
                      isFavourite={favIds.includes(Number(listing.id))}
                      onToggleFavourite={() => toggleFavourite(listing.id)}
                      onPress={() => router.push(`/listing/${listing.id}`)}
                    />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Mobile Right Sidebar Modal */}
      {!isLandscape && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowMobileSidebar(false)}
        >
          <View className="flex-1 flex-row">
            {/* Backdrop */}
            <TouchableOpacity
              activeOpacity={1}
              className="flex-1 bg-black/60"
              onPress={() => setShowMobileSidebar(false)}
            />
            {/* Sidebar Content */}
            <Animated.View
              style={{
                width: width * 0.85,
                height: '100%',
                transform: [{ translateX: slideAnim }]
              }}
            >
              {renderSidebar(() => setShowMobileSidebar(false))}
            </Animated.View>
          </View>
        </Modal>
      )}
      </View>
    </ApprovalGuard>
  );
}
