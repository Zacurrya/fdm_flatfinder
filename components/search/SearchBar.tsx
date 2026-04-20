import { Ionicons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity, View } from "react-native";

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  showFilterButton?: boolean;
  onPressFilter?: () => void;
};

export default function SearchBar({
  value,
  onChangeText,
  showFilterButton = false,
  onPressFilter,
}: SearchBarProps) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-1 flex-row items-center bg-fdm-fg/5 rounded-2xl px-4 py-3 border border-fdm-fg/10">
        <Ionicons name="search" size={20} color="#ffffff60" />
        <TextInput
          className="flex-1 text-fdm-fg ml-3 font-medium text-base outline-none"
          placeholder="Search flat names, location..."
          placeholderTextColor="#ffffff99"
          style={{
            color: "#ffffff",
            lineHeight: 20,
            paddingVertical: 0,
            textAlignVertical: "center",
            includeFontPadding: false,
          }}
          value={value}
          onChangeText={onChangeText}
        />
      </View>

      {showFilterButton && onPressFilter ? (
        <TouchableOpacity
          onPress={onPressFilter}
          className="w-12 h-12 bg-fdm-fg/5 items-center justify-center rounded-2xl border border-fdm-fg/10 active:bg-fdm-fg/10"
        >
          <Ionicons name="options-outline" size={24} color="#ccff00" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
