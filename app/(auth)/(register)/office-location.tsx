import AuthButton from "@components/auth/AuthButton";
import OfficeLocationSelector from "@components/profile/OfficeLocationSelector";
import BackButton from "@components/ui/BackButton";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import { useAuth } from "@hooks/general/useAuth";
import { useCitySelection } from "@hooks/useCitySelection";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  useWindowDimensions
} from "react-native";

const OfficeLocation = () => {
  const { width, height } = useWindowDimensions();
  const { register } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }>();

  const {
    citiesByRegion,
    selectedCity,
    selectedRegion,
    locationsError,
    setLocationsError,
    isLoadingLocations,
    handleSelectCity,
  } = useCitySelection();

  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validates an office has been chosen and submits the form to the auth context
   */
  const handleCompleteSignUp = async () => {
    if (!selectedCity) {
      setLocationsError("Please choose your FDM office city before continuing.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        password: params.password,
        phoneNumber: params.phoneNumber,
        officeLocation: selectedCity.id,
      });
      router.replace("/home");
    } catch (error: any) {
      setLocationsError(error.message ?? "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Image
            source={require("@assets/images/plane.svg")}
            style={{ width: 48, height: 48, marginBottom: 16 }}
            tintColor="#ccff00"
            contentFit="contain"
          />
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
          width="66.7%"
          style={{ alignSelf: 'center', marginTop: 32 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default OfficeLocation;
