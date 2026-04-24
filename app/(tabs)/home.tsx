import ApprovalGuard from "@components/auth/ApprovalGuard";
import HomeHeader from "@components/home/HomeHeader";
import SavedListings from "@components/home/SavedListings";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import FDMLoader from "@components/ui/FDMLoader";
import ListingCard from "@components/ui/ListingCard";
import { useListings } from "@hooks/listings/useListings";
import { useAuth } from "@hooks/useAuth";
import { useSavedListings } from "@hooks/useSavedListings";
import { getCityImagePath } from "@lib/office-cities";
import { FlatList, View } from "react-native";

const Home = () => {
  const { favIds, isLoading: isSavedLoading, toggleFavourite } = useSavedListings();
  const { listings, isLoading: isListingsLoading, goToListing } = useListings();
  const { user } = useAuth();
  const cityImagePath = getCityImagePath(user?.officeLocation ?? "");

  const savedListings = listings.filter(l => favIds.includes(l.id));

  if (isSavedLoading || isListingsLoading) { return (<FDMLoader />) }

  return (
    <ApprovalGuard>
      <View className="flex-1 bg-fdm-bg">
        <BackgroundCircle
          size={300}
          color="#ccff00"
          opacity={0.1}
          y={-25}
          x={200}
        />

        <HomeHeader
          cityName={user?.officeLocation!}
          imagePath={cityImagePath}
        />

        {/* Render the filtered listing objects */}
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={<SavedListings savedListings={savedListings} onPressListing={goToListing} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View className="mx-6 mb-4">
              <ListingCard
                listing={item}
                isFavourite={favIds.includes(item.id)}
                onToggleFavourite={() => toggleFavourite(item.id)}
                onPress={() => goToListing(item.id)}
              />
            </View>
          )}
        />
      </View>
    </ApprovalGuard>
  );
};

export default Home;