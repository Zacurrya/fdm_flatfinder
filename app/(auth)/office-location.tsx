import BackButton from "@components/ui/BackButton";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import OfficeLocationSelector from "@components/ui/OfficeLocationSelector";
import { useAuth } from "@context/AuthContext";
import { OfficeCity } from "@lib/office-cities";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function OfficeLocation() {
  const router = useRouter();
  const { register } = useAuth();

  // Receive form data from the register step
  const params = useLocalSearchParams<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }>();

  const [selectedCity, setSelectedCity] = useState<OfficeCity | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectCity = (region: string, city: OfficeCity) => {
    setSelectedRegion(region);
    setSelectedCity(city);
    setErrorMessage("");
  };

  const handleCompleteSignup = async () => {
    if (!selectedCity) {
      setErrorMessage("Please choose your FDM office city before continuing.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await register({
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      password: params.password,
      phoneNumber: params.phoneNumber,
      officeLocation: selectedCity.name,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error ?? "Registration failed. Please try again.");
      return;
    }

    // Registration successful - continue to app (all screens say "awaiting approval")
    router.replace("/(tabs)/home");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-fdm-bg p-6"
    >
      <StatusBar style="light" />

      {/* Decorative Background Elements */}
      <BackgroundCircle top={-100} right={-100} size={288} color="#CCFF001A" opacity={0.5} />
      <BackgroundCircle bottom={-100} left={-100} size={384} color="#CCFF000D" opacity={0.4} />

      {/* Header */}
      <View className="pt-10 pb-2 w-full max-w-sm self-center flex-row items-center z-10">
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
          selectedCity={selectedCity}
          selectedRegion={selectedRegion}
          onSelectCity={handleSelectCity}
          disabled={isSubmitting}
          errorMessage={errorMessage}
        />

        <TouchableOpacity
          className="w-2/3 self-center bg-fdm-accent py-4 rounded-2xl items-center shadow-lg shadow-fdm-accent/20 active:opacity-80 transition-opacity mt-8"
          onPress={handleCompleteSignup}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#1b1b1b" />
          ) : (
            <Text className="text-fdm-bg font-bold tracking-wide uppercase">Finish Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
