import AppTrademark from "@components/ui/AppTrademark";
import ScreenHeader from "@components/ui/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import { useOfficeSelection } from "@hooks/useOfficeSelection";
import { useUserSettings } from "@hooks/useUserSettings";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LocationChangeForm } from "./LocationChangeForm";

type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
};

const SettingsModal = ({ visible, onClose }: SettingsModalProps) => {
  const { citiesByRegion } = useOfficeSelection();
  const {
    selectedCity,
    selectedRegion,
    handleSelectCity,
    isSubmittingCityChange,
    cityError,
    cityMessage,
    handleRequestCityChange,
  } = useUserSettings(visible);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-fdm-bg">
        {/* Header */}
        <ScreenHeader
          title="Settings"
          condensed
          hasSeparator
          rightElement={
            <TouchableOpacity
              onPress={onClose}
              className="bg-fdm-fg/10 px-4 py-2 rounded-full border border-white/5"
            >
              <Text className="text-fdm-accent font-bold">Done</Text>
            </TouchableOpacity>
          }
        />

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

          {/* Section: Location */}
          <View className="mb-10">
            <View className="flex-row items-center mb-5 gap-2">
              <Ionicons name="location-outline" size={18} color="#ccff00" />
              <Text className="text-white/40 text-xs font-bold uppercase tracking-widest">Location</Text>
            </View>

            <LocationChangeForm
              citiesByRegion={citiesByRegion}
              selectedCity={selectedCity}
              selectedRegion={selectedRegion}
              onSelectCity={handleSelectCity}
              onSubmit={handleRequestCityChange}
              isSubmitting={isSubmittingCityChange}
              errorMessage={cityError}
              successMessage={cityMessage}
            />
          </View>

          <AppTrademark />

        </ScrollView>
      </View >
    </Modal >
  );
};

export default SettingsModal;
