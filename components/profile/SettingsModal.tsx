import CurrencyDropdown from "@components/profile/CurrencyDropdown";
import AppTrademark from "@components/ui/AppTrademark";
import OfficeLocationSelector from "@components/ui/OfficeLocationSelector";
import ScreenHeader from "@components/ui/ScreenHeader";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { OfficeCity, findOfficeCityByName } from "@lib/office-cities";
import * as SettingsController from "@services/settings/settingsController";
import { SupportedCurrency } from "@services/settings/types";
import * as UserController from "@services/user/userController";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { user, refreshUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>("GBP");
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(false);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [currencyError, setCurrencyError] = useState("");
  const [currencyMessage, setCurrencyMessage] = useState("");

  const [selectedCity, setSelectedCity] = useState<OfficeCity | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isSubmittingCityChange, setIsSubmittingCityChange] = useState(false);
  const [cityError, setCityError] = useState("");
  const [cityMessage, setCityMessage] = useState("");

  useEffect(() => {
    if (!visible) {
      setIsCurrencyDropdownOpen(false);
      return;
    }

    setCurrencyError("");
    setCurrencyMessage("");
    setCityError("");
    setCityMessage("");

    const currentCity = findOfficeCityByName(user?.officeLocation ?? "");
    setSelectedCity(currentCity?.city ?? null);
    setSelectedRegion(currentCity?.region ?? "");

    if (!user?.userId) return;

    setIsLoadingCurrency(true);
    SettingsController.getUserCurrency(user.userId)
      .then((result) => {
        if (result.success) {
          setSelectedCurrency(result.data?.currency ?? "GBP");
        }
      })
      .finally(() => setIsLoadingCurrency(false));
  }, [visible, user?.officeLocation, user?.userId]);

  const handleSaveCurrency = async () => {
    if (!user?.userId) return;

    setCurrencyError("");
    setCurrencyMessage("");
    setIsSavingCurrency(true);

    const result = await SettingsController.upsertUserCurrency(user.userId, selectedCurrency);
    setIsSavingCurrency(false);

    if (!result.success) {
      setCurrencyError(result.error ?? "Failed to update currency.");
      return;
    }

    setCurrencyMessage("Currency preference updated.");
  };

  const handleRequestCityChange = async () => {
    if (!user?.userId || !selectedCity) return;

    if (selectedCity.name === user.officeLocation) {
      setCityError("Please choose a different city.");
      return;
    }

    setCityError("");
    setCityMessage("");
    setIsSubmittingCityChange(true);

    const result = await UserController.requestOfficeLocationChange(user.userId, selectedCity.name);
    if (!result.success) {
      setIsSubmittingCityChange(false);
      setCityError(result.error ?? "Failed to submit request.");
      return;
    }

    await refreshUser();
    setIsSubmittingCityChange(false);
    setCityMessage("Request submitted. Awaiting admin approval.");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-fdm-bg">
        {/* Modern Header */}
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

          {/* Section: Preferences */}
          <View className="mb-10">
            <View className="flex-row items-center mb-5 gap-2">
              <Ionicons name="options-outline" size={18} color="#ccff00" />
              <Text className="text-white/40 text-xs font-bold uppercase tracking-widest">Preferences</Text>
            </View>

            <View className="bg-white/5 border border-white/5 rounded-3xl p-5">
              <Text className="text-white text-base font-bold">Preferred Currency</Text>
              <Text className="text-white/50 text-xs mt-1 mb-4">Choose how you want to see listing prices.</Text>

              <CurrencyDropdown
                value={selectedCurrency}
                isOpen={isCurrencyDropdownOpen}
                disabled={isLoadingCurrency || isSavingCurrency}
                onToggle={() => setIsCurrencyDropdownOpen((prev) => !prev)}
                onSelect={(currency) => {
                  setSelectedCurrency(currency);
                  setIsCurrencyDropdownOpen(false);
                }}
              />

              <TouchableOpacity
                className="mt-8 bg-fdm-accent px-8 py-2 self-center rounded-full flex-row items-center justify-center active:scale-[0.98] shadow-lg shadow-fdm-accent/40"
                onPress={handleSaveCurrency}
                disabled={isLoadingCurrency || isSavingCurrency}
              >
                {isSavingCurrency ? (
                  <ActivityIndicator color="#1b1b1b" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#1b1b1b" style={{ marginRight: 8 }} />
                    <Text className="text-fdm-bg font-black text-xs uppercase tracking-[2px]">Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>

              {currencyError ? <Text className="text-red-400 text-xs mt-4 text-center">{currencyError}</Text> : null}
              {currencyMessage ? <Text className="text-fdm-accent text-xs mt-4 text-center">{currencyMessage}</Text> : null}
            </View>
          </View>

          {/* Section: Location */}
          <View className="mb-10">
            <View className="flex-row items-center mb-5 gap-2">
              <Ionicons name="location-outline" size={18} color="#ccff00" />
              <Text className="text-white/40 text-xs font-bold uppercase tracking-widest">Location</Text>
            </View>

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
                selectedCity={selectedCity}
                selectedRegion={selectedRegion}
                onSelectCity={(region, city) => {
                  setSelectedRegion(region);
                  setSelectedCity(city);
                  setCityError("");
                  setCityMessage("");
                }}
                disabled={isSubmittingCityChange}
                errorMessage={cityError}
              />

              <TouchableOpacity
                className="mt-8 bg-white/5 border border-fdm-accent/30 px-8 py-2 self-center rounded-full flex-row items-center justify-center active:scale-[0.98]"
                onPress={handleRequestCityChange}
                disabled={isSubmittingCityChange}
              >
                {isSubmittingCityChange ? (
                  <ActivityIndicator color="#ccff00" />
                ) : (
                  <>
                    <Ionicons name="paper-plane-outline" size={18} color="#ccff00" style={{ marginRight: 8 }} />
                    <Text className="text-fdm-accent font-black text-xs uppercase tracking-[2px]">Submit Transfer</Text>
                  </>
                )}
              </TouchableOpacity>

              {cityMessage ? <Text className="text-fdm-accent text-xs mt-4 text-center">{cityMessage}</Text> : null}
            </View>
          </View>

          <AppTrademark />

        </ScrollView>
      </View>
    </Modal>
  );
}
