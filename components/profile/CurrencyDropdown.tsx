import { Ionicons } from "@expo/vector-icons";
import { SupportedCurrency, supportedCurrencies } from "@services/settings/settings.types";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type CurrencyDropdownProps = {
  value: SupportedCurrency;
  isOpen: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onSelect: (currency: SupportedCurrency) => void;
};

export default function CurrencyDropdown({
  value,
  isOpen,
  disabled = false,
  onToggle,
  onSelect,
}: CurrencyDropdownProps) {
  return (
    <View className="mt-4">
      <TouchableOpacity
        className="h-12 px-4 rounded-xl border border-fdm-fg/15 bg-fdm-fg/5 flex-row items-center justify-between"
        onPress={onToggle}
        disabled={disabled}
      >
        <Text className="text-fdm-fg text-sm font-semibold">{value}</Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color="#ffffff99"
        />
      </TouchableOpacity>

      {isOpen ? (
        <View className="mt-2 rounded-xl border border-fdm-fg/15 bg-[#101010] overflow-hidden">
          {supportedCurrencies.map((currency) => {
            const isSelected = value === currency;
            return (
              <TouchableOpacity
                key={currency}
                className={`px-4 py-3 border-b border-fdm-fg/10 ${isSelected ? "bg-fdm-accent/20" : "bg-transparent"}`}
                onPress={() => onSelect(currency)}
                disabled={disabled}
              >
                <Text className={`${isSelected ? "text-fdm-accent" : "text-fdm-fg/80"} text-sm font-semibold`}>
                  {currency}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
