import OfficeLocationSelector from "@components/ui/OfficeLocationSelector";
import { Ionicons } from "@expo/vector-icons";
import { OfficeCity, RegionCities } from "@/types/locations";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type LocationChangeFormProps = {
  citiesByRegion: RegionCities[];
  selectedCity: OfficeCity | null;
  selectedRegion: string;
  onSelectCity: (region: string, city: OfficeCity | null) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  errorMessage?: string;
  successMessage?: string;
};

/**
 * LocationChangeForm
 * Component for requesting a change in the user's office location/city.
 */
export const LocationChangeForm = ({
  citiesByRegion,
  selectedCity,
  selectedRegion,
  onSelectCity,
  onSubmit,
  isSubmitting,
  errorMessage,
  successMessage,
}: LocationChangeFormProps) => {
  return (
    <View className="bg-white/5 border border-white/5 rounded-3xl p-5">
      <View className="flex-row items-start gap-4 mb-6">
        <View className="w-10 h-10 rounded-xl bg-orange-400/20 items-center justify-center border border-orange-400/30">
          <Ionicons name="warning" size={20} color="#fb923c" />
        </View>
        <View className="flex-1">
          <Text className="text-white text-base font-bold">Request City Change</Text>
          <Text className="text-orange-200/60 text-xs mt-1 leading-relaxed">
            Moving to a new city requires manual approval from our admin team.
          </Text>
        </View>
      </View>

      <OfficeLocationSelector
        label="City"
        citiesByRegion={citiesByRegion}
        selectedCity={selectedCity}
        selectedRegion={selectedRegion}
        onSelectCity={onSelectCity}
        disabled={isSubmitting}
        errorMessage={errorMessage}
      />

      <TouchableOpacity
        className="mt-8 bg-white/5 border border-fdm-accent/30 px-8 py-2 self-center rounded-full flex-row items-center justify-center active:scale-[0.98]"
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ccff00" />
        ) : (
          <>
            <Ionicons name="paper-plane-outline" size={18} color="#ccff00" style={{ marginRight: 8 }} />
            <Text className="text-fdm-accent font-black text-xs uppercase tracking-[2px]">Submit Transfer</Text>
          </>
        )}
      </TouchableOpacity>

      {successMessage ? (
        <Text className="text-fdm-accent text-xs mt-4 text-center">{successMessage}</Text>
      ) : null}
    </View>
  );
};
