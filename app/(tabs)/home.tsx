import HomeHeader from "@components/home/HomeHeader";
import AwaitingApprovalView from "@components/ui/AwaitingApprovalView";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import ListingCard, { ListingCardData } from "@components/ui/ListingCard";
import { useAuth } from "@context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

const PLACEHOLDER_LISTINGS: ListingCardData[] = [
  { id: 1, title: "Modern Studio", location: "Canary Wharf, London", price: "£1,850/mo", beds: 1, baths: 1 },
  { id: 2, title: "2-Bed Apartment", location: "Manchester City Centre", price: "£1,200/mo", beds: 2, baths: 1 },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const cityName = user?.officeLocation || "home";

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

  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" hidden={width > height} />

      <BackgroundCircle top={0} right={0} color="#CCFF001A" opacity={0.5} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          cityName={cityName}
          firstName={user?.firstName}
          officeLocation={user?.officeLocation}
        />

        {/* Featured Listings */}
        <View className="px-6 mb-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-fdm-fg text-lg font-bold tracking-tight">Featured/Favourited Listings (Undecided)</Text>
            <TouchableOpacity>
              <Text className="text-fdm-accent text-sm font-semibold">See all</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-4">
            {PLACEHOLDER_LISTINGS.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
