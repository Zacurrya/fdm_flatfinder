import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { fdmOfficeCitiesByRegion } from "../../library/office-cities";
import CityModal from "./components/CityModal";

export default function OfficeLocation() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedLabel = useMemo(() => {
    if (!selectedCity) {
      return "Choose your city";
    }

    return `${selectedCity} (${selectedRegion})`;
  }, [selectedCity, selectedRegion]);

  const handleSelectCity = (region: string, city: string) => {
    setSelectedRegion(region);
    setSelectedCity(city);
    setErrorMessage("");
    setIsDropdownOpen(false);
  };

  const handleCompleteSignup = () => {
    if (!selectedCity) {
      setErrorMessage("Please choose your FDM office city before continuing.");
      return;
    }

    router.replace("/(auth)/login");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-fdm-bg p-6"
    >
      <StatusBar style="light" />

      {/* Decorative Background Elements */}
      <View className="absolute top-[-100px] right-[-100px] w-72 h-72 bg-fdm-accent/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <View className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-fdm-accent/5 rounded-full blur-3xl opacity-40 pointer-events-none" />

      {/* Header */}
      <View className="pt-10 pb-2 w-full max-w-sm self-center flex-row items-center z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 items-center justify-center rounded-full bg-fdm-fg/10 active:bg-fdm-fg/20 border border-fdm-fg/10"
        >
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 w-full max-w-sm self-center justify-center z-10 mb-12">
        <View className="items-center mt-3 mb-12 w-full">
          <Text className="text-fdm-fg text-3xl mb-3 tracking-tighter text-center" style={{ fontFamily: "Michroma_400Regular" }}>
            Where <Text className="text-fdm-accent">To?</Text>
          </Text>
          <Text className="text-fdm-fg/50 text-sm text-center">
            Step 2 of 2: Select the city for your nearest FDM office.
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
          >
            <Text className={`${selectedCity ? "text-fdm-fg" : "text-fdm-fg/50"} text-base`}>
              {selectedLabel}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#ffffff80" />
          </TouchableOpacity>
          {errorMessage ? <Text className="text-red-400 text-sm mt-1">{errorMessage}</Text> : null}
        </View>

        <TouchableOpacity
          className="w-2/3 self-center bg-fdm-accent py-4 rounded-2xl items-center shadow-lg shadow-fdm-accent/20 active:opacity-80 transition-opacity mt-8"
          onPress={handleCompleteSignup}
        >
          <Text className="text-fdm-bg font-bold tracking-wide uppercase">Finish Sign Up</Text>
        </TouchableOpacity>
      </View>

      <CityModal
        visible={isDropdownOpen}
        citiesByRegion={fdmOfficeCitiesByRegion}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        onClose={() => setIsDropdownOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}
