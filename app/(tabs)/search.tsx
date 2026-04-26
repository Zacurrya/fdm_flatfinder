import ApprovalGuard from "@components/auth/ApprovalGuard";
import ListingList from "@components/listing/ListingList";
import FilterSidebar from "@components/search/FilterSidebar";
import SearchBar from "@components/search/SearchBar";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import ScreenHeader from "@components/ui/ScreenHeader";
import { useListings } from "@hooks/listings/useListings";
import { useState } from "react";
import { Modal, Pressable, ScrollView, useWindowDimensions, View } from "react-native";

const SearchScreen = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [showFilters, setShowFilters] = useState(false);

  // Props from useListings hook
  const {
    allListings,
    savedListingIds,
    isLoading,
    toggleFavourite,
    filters,
    updateFilter,
    clearAllFilters,
  } = useListings();

  const sidebarProps = {
    ...filters,
    setMinPrice: (val: string) => updateFilter("minPrice", val),
    setMaxPrice: (val: string) => updateFilter("maxPrice", val),
    setBedrooms: (val: number | null) => updateFilter("bedrooms", val),
    setBathrooms: (val: number | null) => updateFilter("bathrooms", val),
    setSourceFilter: (val: string | null) => updateFilter("sourceFilter", val),
    onClearAll: clearAllFilters,
  };

  const renderFilterContent = (onClose?: () => void) => (
    <View className={`${isLandscape ? 'w-80' : 'w-full'} bg-fdm-bg h-full`}>
      <FilterSidebar
        {...sidebarProps}
        onClose={onClose}
      />
    </View>
  );

  return (
    <ApprovalGuard>
      <View className="flex-1 bg-fdm-bg">
        <BackgroundCircle y={0} x="80%" color="#CCFF001A" opacity={0.5} />
        <BackgroundCircle y="90%" x={-100} size={400} color="#CCFF00" opacity={0.05} />
        <BackgroundCircle y={400} x="90%" size={600} color="#CCFF00" opacity={0.03} />
        <View className="flex-1 flex-row">
          {/* Landscape Sidebar */}
          {isLandscape && renderFilterContent()}

          {/* Main Content */}
          <View className="flex-1">
            {/* Header */}
            <ScreenHeader title="Search" highlightedTitle="Properties" />
            <View className="px-6 border-b border-fdm-fg/10">
              <SearchBar
                value={filters.searchQuery || ""}
                onChangeText={(val) => updateFilter("searchQuery", val)}
                showFilterButton={!isLandscape}
                onPressFilter={() => setShowFilters(true)}
              />
            </View>

            {/* Results list */}
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
              <ListingList
                listings={allListings}
                isLoading={isLoading}
                savedListingIds={savedListingIds}
                toggleFavourite={toggleFavourite}
                onClearFilters={clearAllFilters}
                filters={filters}
              />
            </ScrollView>
          </View>
        </View>

        {/* Floating Filter Drawer */}
        {!isLandscape && (
          <Modal
            visible={showFilters}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowFilters(false)}
          >
            <Pressable
              className="flex-1 bg-transparent flex-row justify-end"
              onPress={() => setShowFilters(false)}
            >
              <Pressable
                className="bg-fdm-bg w-[85%] h-full border-l border-white/10 shadow-2xl rounded-l-2xl"
                onPress={(e) => e.stopPropagation()}
              >
                {renderFilterContent(() => setShowFilters(false))}
              </Pressable>
            </Pressable>
          </Modal>
        )}
      </View>
    </ApprovalGuard>
  );
};

export default SearchScreen;
