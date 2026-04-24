import ApprovalGuard from "@components/auth/ApprovalGuard";
import { AddListingForm } from "@components/listing/AddListingForm";
import AppTrademark from "@components/ui/AppTrademark";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import ScreenHeader from "@components/ui/ScreenHeader";
import { StatusBar } from "expo-status-bar";
import { ScrollView, View } from "react-native";

const AddListingScreen = () => {
  return (
    <ApprovalGuard>
      <View className="flex-1 bg-fdm-bg">
        <StatusBar style="light" />
        <BackgroundCircle y={0} x="80%" color="#CCFF001A" opacity={0.5} />
        <BackgroundCircle y="80%" x={-100} size={500} color="#CCFF00" opacity={0.05} />
        <BackgroundCircle y={200} x="80%" size={400} color="#CCFF00" opacity={0.03} />

        <ScreenHeader title="Add" highlightedTitle="Listing" />

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60, paddingTop: 0 }}>
          <AddListingForm />
          <AppTrademark />
        </ScrollView>
      </View>
    </ApprovalGuard>
  );
};

export default AddListingScreen;
