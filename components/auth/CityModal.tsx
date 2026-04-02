import { RegionCities } from "@lib/office-cities";
import React from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

type CityModalProps = {
  visible: boolean;
  citiesByRegion: RegionCities[];
  selectedCity: string;
  onSelectCity: (region: string, city: string) => void;
  onClose: () => void;
};

export default function CityModal({
  visible,
  citiesByRegion,
  selectedCity,
  onSelectCity,
  onClose,
}: CityModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center px-6" onPress={onClose}>
        <Pressable className="max-h-[75%] bg-[#141414] border border-fdm-fg/10 rounded-2xl p-4">
          <Text className="text-fdm-fg text-lg font-bold mb-4">Select your FDM office city</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {citiesByRegion.map((group) => (
              <View key={group.region} className="mb-4">
                <Text className="text-fdm-accent text-xs uppercase tracking-widest mb-2">{group.region}</Text>
                <View className="gap-2">
                  {group.cities.map((city) => {
                    const isSelected = selectedCity === city;
                    return (
                      <TouchableOpacity
                        key={`${group.region}-${city}`}
                        className={`px-3 py-3 rounded-xl border ${isSelected ? "bg-fdm-accent/20 border-fdm-accent" : "bg-fdm-fg/5 border-fdm-fg/10"}`}
                        onPress={() => onSelectCity(group.region, city)}
                      >
                        <Text className={`text-sm ${isSelected ? "text-fdm-accent" : "text-fdm-fg"}`}>{city}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
