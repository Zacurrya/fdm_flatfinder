import { Ionicons } from "@expo/vector-icons";
import { OfficeCity, RegionCities } from "@lib/office-cities";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

type CityModalProps = {
  visible: boolean;
  citiesByRegion: RegionCities[];
  selectedCityName: string;
  onSelectCity: (region: string, city: OfficeCity) => void;
  onClose: () => void;
};

const regionIconMap: Record<string, number> = {
  Europe: require("@/assets/images/region-icons/europe.svg"),
  "North America": require("@/assets/images/region-icons/north-america.svg"),
  Asia: require("@/assets/images/region-icons/asia.svg"),
  Oceania: require("@/assets/images/region-icons/oceania.svg"),
  Africa: require("@/assets/images/region-icons/africa.svg"),
};

export default function CityModal({
  visible,
  citiesByRegion,
  selectedCityName,
  onSelectCity,
  onClose,
}: CityModalProps) {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const selectedRegionGroup = useMemo(
    () => citiesByRegion.find((group) => group.region === activeRegion),
    [citiesByRegion, activeRegion]
  );

  useEffect(() => {
    if (!visible) {
      setActiveRegion(null);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center px-6" onPress={onClose}>
        <Pressable className="max-h-[75%] bg-[#141414] border border-fdm-fg/10 rounded-2xl p-4">
          {activeRegion ? (
            <>
              <View className="flex-row items-center mb-4">
                <TouchableOpacity
                  className="w-9 h-9 rounded-full items-center justify-center bg-fdm-fg/10 border border-fdm-fg/10"
                  onPress={() => setActiveRegion(null)}
                  accessibilityLabel="Back to regions"
                >
                  <Ionicons name="arrow-back" size={18} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-fdm-fg text-lg font-bold ml-3">{activeRegion}</Text>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-2">
                  {(selectedRegionGroup?.cities ?? []).map((city) => {
                    const isSelected = selectedCityName === city.name;
                    const flagUrl = `https://flagsapi.com/${city.countryCode.toUpperCase()}/flat/32.png`;
                    return (
                      <TouchableOpacity
                        key={`${activeRegion}-${city.name}`}
                        className={`px-3 py-3 rounded-xl border ${isSelected ? "bg-fdm-accent/20 border-fdm-accent" : "bg-fdm-fg/5 border-fdm-fg/10"}`}
                        onPress={() => onSelectCity(activeRegion, city)}
                      >
                        <View className="flex-row items-center gap-2.5">
                          <Image source={{ uri: flagUrl }} style={{ width: 24, height: 24 }} contentFit="contain" />
                          <Text className={`text-sm ${isSelected ? "text-fdm-accent" : "text-fdm-fg"}`}>{city.name}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </>
          ) : (
            <>
              <Text className="text-fdm-fg text-lg font-bold mb-4">Select your region</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-2">
                  {citiesByRegion.map((group) => (
                    <TouchableOpacity
                      key={group.region}
                      className="py-2 px-3 rounded-xl border bg-fdm-fg/5 border-fdm-fg/10"
                      onPress={() => setActiveRegion(group.region)}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                          <View className="w-16 h-14 rounded-lg bg-fdm-fg/10 border border-fdm-fg/10 items-center justify-center overflow-hidden">
                            <Image
                              source={regionIconMap[group.region]}
                              style={{ width: 44, height: 44 }}
                              contentFit="contain"
                            />
                          </View>
                          <Text className="text-fdm-fg text-sm">{group.region}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#ffffff80" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
