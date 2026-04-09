import CityModal from "@components/auth/CityModal";
import BackButton from "@components/ui/BackButton";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { fdmOfficeCitiesByRegion, OfficeCity } from "@lib/office-cities";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCityFlagUrl = selectedCity
    ? `https://flagsapi.com/${selectedCity.countryCode.toUpperCase()}/flat/32.png`
    : null;

  const selectedLabel = useMemo(() => {
    if (!selectedCity) {
      return "Choose your city";
    }

    return `${selectedCity.name} (${selectedRegion})`;
  }, [selectedCity, selectedRegion]);

  const handleSelectCity = (region: string, city: OfficeCity) => {
    setSelectedRegion(region);
    setSelectedCity(city);
    setErrorMessage("");
    setIsDropdownOpen(false);
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

        <View className="w-full gap-3">
          <Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">
            City
          </Text>
          <TouchableOpacity
            className="h-17 bg-fdm-fg/5 border-[1.5px] border-fdm-fg/10 rounded-2xl px-4 py-3 flex-row items-center justify-between"
            onPress={() => setIsDropdownOpen(true)}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            <View className="flex-row items-center gap-2.5 flex-1 pr-3">
              {selectedCityFlagUrl ? (
                <Image source={{ uri: selectedCityFlagUrl }} style={{ width: 22, height: 22 }} contentFit="contain" />
              ) : null}
              <Text className={`${selectedCity ? "text-fdm-fg" : "text-fdm-fg/50"} text-base flex-1`} numberOfLines={1}>
                {selectedLabel}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#ffffff80" />
          </TouchableOpacity>
          {errorMessage ? <Text className="text-red-400 text-sm mt-1">{errorMessage}</Text> : null}
        </View>

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

      <CityModal
        visible={isDropdownOpen}
        citiesByRegion={fdmOfficeCitiesByRegion}
        selectedCityName={selectedCity?.name ?? ""}
        onSelectCity={handleSelectCity}
        onClose={() => setIsDropdownOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}
