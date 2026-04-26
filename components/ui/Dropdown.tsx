import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type DropdownOption<T = any> = {
  label: string;
  value: T;
};

export type DropdownProps<T = any> = {
  label?: string;
  value: T | null | undefined;
  options: DropdownOption<T>[];
  onChange: (val: T) => void;
  placeholder?: string;
  style?: any;
  className?: string;
};

export function Dropdown<T = any>({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  style,
  className = "",
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <View style={[{ flex: 1 }, style]} className={className}>
      <TouchableOpacity
        onPress={() => setOpen((o) => !o)}
        className="h-14 bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl px-4 flex-row items-center justify-between"
      >
        <Text className="text-fdm-fg font-medium text-base">
          {selected ? selected.label : label || placeholder}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color="#ccff00" />
      </TouchableOpacity>
      {open && (
        <View className="absolute left-0 right-0 top-16 bg-fdm-bg border border-fdm-fg/10 rounded-2xl z-50 shadow-xl">
          {options.map((opt) => (
            <TouchableOpacity
              key={String(opt.value)}
              onPress={() => {
                setOpen(false);
                onChange(opt.value);
              }}
              className="px-4 py-3 border-b border-fdm-fg/10"
            >
              <Text className="text-fdm-fg text-base">{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
