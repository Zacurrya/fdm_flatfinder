import CityModal from "@components/auth/CityModal";
import { Ionicons } from "@expo/vector-icons";
import { OfficeCity, RegionCities } from "@lib/office-cities";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type OfficeLocationSelectorProps = {
  label?: string;
  placeholder?: string;
  selectedCity: OfficeCity | null;
  selectedRegion: string;
  citiesByRegion: RegionCities[];
  disabled?: boolean;
  errorMessage?: string;
  onSelectCity: (region: string, city: OfficeCity) => void;
};

const OfficeLocationSelector = ({
  label = "City",
  placeholder = "Where to?",
  selectedCity,
  selectedRegion,
  citiesByRegion,
  disabled = false,
  errorMessage,
  onSelectCity,
}: OfficeLocationSelectorProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Country flag image URL
  const selectedCityFlagUrl = selectedCity
    ? `https://flagsapi.com/${selectedCity.countryCode.toUpperCase()}/flat/32.png`
    : null;

  // Label for the city and region
  const selectedLabel = useMemo(() => {
    if (!selectedCity) { return placeholder }

    return `${selectedCity.name} (${selectedRegion})`;
  }, [placeholder, selectedCity, selectedRegion]);

  return (
    <View className="w-full gap-3">
      <Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">{label}</Text>
      <TouchableOpacity
        className="h-17 bg-fdm-fg/5 border-[1.5px] border-fdm-fg/10 rounded-2xl px-4 py-3 flex-row items-center justify-between"
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
        disabled={disabled}
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

      <CityModal
        visible={isModalVisible}
        citiesByRegion={citiesByRegion}
        selectedCityName={selectedCity?.name ?? ""}
        onSelectCity={(region, city) => {
          onSelectCity(region, city);
          setIsModalVisible(false);
        }}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
};

export default OfficeLocationSelector;