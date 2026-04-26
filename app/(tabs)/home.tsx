import ApprovalGuard from "@components/auth/ApprovalGuard";
import HomeHeader from "@components/home/HomeHeader";
import ListingList from "@components/listing/ListingList";
import ProfileModal from "@components/profile/ProfileModal";
import ProfilePic from "@components/profile/ProfilePic";
import AppTrademark from "@components/ui/AppTrademark";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import { useListings } from "@hooks/listings/useListings";
import { useAuth } from "@hooks/general/useAuth";
import { getCityImageById } from "@lib/office-cities";
import { useState } from "react";
import { Text, View } from "react-native";

const Home = () => {
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const { listings, isLoading, savedListingIds, toggleFavourite } = useListings({ onlySaved: true } as any);
  const { user } = useAuth();
  if (!user) return null;

  const cityImagePath = getCityImageById(user?.officeLocationId ?? "");

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

        {/* Global Profile Trigger */}
        <View className="absolute top-16 right-6 z-50">
          <ProfilePic size={52} onPress={() => setIsProfileVisible(true)} />
        </View>

        {/* Header content and Feed */}
        <View className="flex-1">
          <HomeHeader
            cityName={user?.officeLocation!}
            imagePath={cityImagePath}
          />

          <Text className="text-fdm-fg font-bold px-6 mb-2 mt-4 uppercase tracking-widest text-sm">Your Saved Listings</Text>

          <View className="px-6 flex-1">
            <ListingList
              listings={listings}
              isLoading={isLoading}
              savedListingIds={savedListingIds}
              toggleFavourite={toggleFavourite}
              filters={{ onlySaved: true }}
              emptyMessage="You haven't saved any listings yet."
            />
          </View>
        </View>

        <ProfileModal
          visible={isProfileVisible}
          onClose={() => setIsProfileVisible(false)}
        />
        <AppTrademark />
      </View>
    </ApprovalGuard>
  );
};

export default Home;
