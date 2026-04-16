import CurrencyDropdown from "@components/profile/CurrencyDropdown";
import OfficeLocationSelector from "@components/ui/OfficeLocationSelector";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { OfficeCity, findOfficeCityByName } from "@lib/office-cities";
import { SupportedCurrency } from "@services/settings/settings.types";
import * as SettingsController from "@services/settings/settingsController";
import * as UserController from "@services/user/userController";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { user, refreshUser } = useAuth();
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

    if (!user?.userId) {
      return;
    }

    setIsLoadingCurrency(true);
    void SettingsController.getUserCurrency(user.userId)
      .then((result) => {
        if (!result.success) {
          setCurrencyError(result.error ?? "Failed to load your currency setting.");
          return;
        }

        setSelectedCurrency(result.data?.currency ?? "GBP");
      })
      .finally(() => {
        setIsLoadingCurrency(false);
      });
  }, [visible, user?.officeLocation, user?.userId]);

  const handleSaveCurrency = async () => {
    if (!user?.userId) {
      setCurrencyError("No active user session.");
      return;
    }

    setCurrencyError("");
    setCurrencyMessage("");
    setIsSavingCurrency(true);

    const result = await SettingsController.upsertUserCurrency(user.userId, selectedCurrency);
    setIsSavingCurrency(false);

    if (!result.success) {
      setCurrencyError(result.error ?? "Failed to update currency.");
      return;
    }

    setCurrencyMessage("Currency updated.");
  };

  const handleRequestCityChange = async () => {
    if (!user?.userId) {
      setCityError("No active user session.");
      return;
    }

    if (!selectedCity) {
      setCityError("Please select a city first.");
      return;
    }

    if (selectedCity.name === user.officeLocation) {
      setCityError("Please choose a different city to request a change.");
      return;
    }

    setCityError("");
    setCityMessage("");
    setIsSubmittingCityChange(true);

    const result = await UserController.requestOfficeLocationChange(user.userId, selectedCity.name);
    if (!result.success) {
      setIsSubmittingCityChange(false);
      setCityError(result.error ?? "Failed to submit city change request.");
      return;
    }

    await refreshUser();
    setIsSubmittingCityChange(false);
    setCityMessage("City change submitted. Your account is now awaiting admin approval.");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center px-6" onPress={onClose}>
        <Pressable className="bg-[#141414] border border-fdm-fg/10 rounded-2xl p-5 max-h-[84%]" onPress={(event) => event.stopPropagation()}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-fdm-fg text-lg font-bold">Settings</Text>
            <TouchableOpacity
              className="w-9 h-9 rounded-full items-center justify-center bg-fdm-fg/10 border border-fdm-fg/10"
              onPress={onClose}
              accessibilityLabel="Close settings"
            >
              <Ionicons name="close" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-6 pb-2">
              <View className="rounded-2xl border border-fdm-fg/10 bg-fdm-fg/5 p-4">
                <Text className="text-fdm-fg text-base font-semibold">Preferred currency</Text>
                <Text className="text-fdm-fg/60 text-xs mt-1">This updates your user settings immediately.</Text>

                <CurrencyDropdown
                  value={selectedCurrency}
                  isOpen={isCurrencyDropdownOpen}
                  disabled={isLoadingCurrency || isSavingCurrency}
                  onToggle={() => setIsCurrencyDropdownOpen((previous) => !previous)}
                  onSelect={(currency) => {
                    setSelectedCurrency(currency);
                    setIsCurrencyDropdownOpen(false);
                  }}
                />

                <TouchableOpacity
                  className="w-[60%] self-center mt-4 rounded-xl bg-fdm-accent py-3 items-center disabled:opacity-60"
                  onPress={handleSaveCurrency}
                  disabled={isLoadingCurrency || isSavingCurrency}
                >
                  {isLoadingCurrency || isSavingCurrency ? (
                    <ActivityIndicator color="#1b1b1b" />
                  ) : (
                    <Text className="text-fdm-bg font-semibold">Save currency</Text>
                  )}
                </TouchableOpacity>

                {currencyError ? <Text className="text-red-400 text-xs mt-3">{currencyError}</Text> : null}
                {currencyMessage ? <Text className="text-fdm-accent text-xs mt-3">{currencyMessage}</Text> : null}
              </View>

              <View className="rounded-2xl border border-fdm-fg/10 bg-fdm-fg/5 p-4">
                <Text className="text-fdm-fg text-base font-semibold">Office city</Text>
                <View className="mt-2 flex-row items-start gap-2 rounded-lg border border-orange-400/40 bg-orange-400/10 px-3 py-2">
                  <Ionicons name="warning-outline" size={16} color="#fb923c" style={{ marginTop: 1 }} />
                  <Text className="text-orange-200 text-xs flex-1">
                    Changing city requires admin approval and will move your account back to pending.
                  </Text>
                </View>

                <View className="mt-4">
                  <OfficeLocationSelector
                    label="New office city"
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
                </View>

                <TouchableOpacity
                  className="w-[60%] self-center mt-4 rounded-xl border border-fdm-accent/60 py-3 items-center disabled:opacity-60"
                  onPress={handleRequestCityChange}
                  disabled={isSubmittingCityChange}
                >
                  {isSubmittingCityChange ? (
                    <ActivityIndicator color="#CCFF00" />
                  ) : (
                    <Text className="text-fdm-accent font-semibold">Request city change</Text>
                  )}
                </TouchableOpacity>

                {cityMessage ? <Text className="text-fdm-accent text-xs mt-3">{cityMessage}</Text> : null}
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
