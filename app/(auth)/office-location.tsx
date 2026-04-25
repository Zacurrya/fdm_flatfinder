import AuthButton from "@components/auth/AuthButton";
import BackButton from "@components/ui/BackButton";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import OfficeLocationSelector from "@components/ui/OfficeLocationSelector";
import { useOfficeLocations } from "@hooks/useLocationForm";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  useWindowDimensions
} from "react-native";

const OfficeLocation = () => {
  const { width, height } = useWindowDimensions();
  const {
    citiesByRegion,
    selectedCity,
    selectedRegion,
    locationsError,
    isLoadingLocations,
    isSubmitting,
    handleSelectCity,
    handleCompleteSignUp,
  } = useOfficeLocations();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-fdm-bg p-6"
    >
      <StatusBar style="light" hidden={width > height} />

      {/* Decorative Background Elements */}
      <BackgroundCircle y={-100} x="90%" size={288} color="#CCFF001A" opacity={0.5} />
      <BackgroundCircle y="90%" x={-100} size={384} color="#CCFF000D" opacity={0.4} />

      {/* Header */}
      <View className={`${width > height ? "pt-4" : "pt-10"} pb-2 w-full max-w-sm self-center flex-row items-center z-10`}>
        <BackButton />
      </View>

      <View className="flex-1 w-full max-w-sm self-center justify-center z-10 mb-12">
        <View className="items-center mt-3 mb-12 w-full">
          <Text className="text-fdm-fg text-3xl mb-3 tracking-tighter text-center" style={{ fontFamily: "Michroma_400Regular" }}>
            Where <Text className="text-fdm-accent">To?</Text>
          </Text>
          <Text className="text-fdm-fg/50 text-sm text-center">
            Select the city situating your FDM home office.
          </Text>
        </View>

        <OfficeLocationSelector
          citiesByRegion={citiesByRegion}
          selectedCity={selectedCity}
          selectedRegion={selectedRegion}
          onSelectCity={handleSelectCity}
          disabled={isLoadingLocations || isSubmitting}
          errorMessage={locationsError || undefined}
        />

        <AuthButton
          label="Finish Sign Up"
          onPress={handleCompleteSignUp}
          isLoading={isSubmitting}
          backgroundColour="#ccff00"
          textColour="#1b1b1b"
          width="66.666667%" // matches w-2/3
          style={{ alignSelf: 'center', marginTop: 32 }} // mt-8
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default OfficeLocation;
