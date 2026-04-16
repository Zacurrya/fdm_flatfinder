import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

type FilterSidebarProps = {
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  bedrooms: number | null;
  setBedrooms: (val: number | null) => void;
  bathrooms: number | null;
  setBathrooms: (val: number | null) => void;
  sourceFilter: string | null;
  setSourceFilter: (val: string | null) => void;
  onClose?: () => void;
};

const BED_OPTIONS = [1, 2, 3, 4, 5];
const BATH_OPTIONS = [1, 2, 3];

export default function FilterSidebar({
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  bedrooms,
  setBedrooms,
  bathrooms,
  setBathrooms,
  sourceFilter,
  setSourceFilter,
  onClose,
}: FilterSidebarProps) {
  return (
    <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center justify-between mb-6 px-1">
        <View>
          <Text className="text-xl font-bold text-fdm-fg" style={{ fontFamily: "Michroma_400Regular" }}>
            Filters
          </Text>
          <Text className="text-fdm-fg/50 text-xs mt-1">Refine listings in your office location</Text>
        </View>
        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 items-center justify-center bg-fdm-fg/5 border border-fdm-fg/10 rounded-full active:opacity-70"
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Price Range */}
      <View className="mb-4 bg-fdm-fg/[0.03] border border-fdm-fg/10 rounded-2xl p-4">
        <View className="flex-row items-center gap-2 mb-3">
          <Ionicons name="cash-outline" size={16} color="#ccff00" />
          <Text className="text-fdm-fg/80 font-semibold">Price Range (£ per month)</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="flex-1 h-11 bg-fdm-fg/5 border border-fdm-fg/10 rounded-xl px-3 justify-center">
            <TextInput
              className="text-fdm-fg font-medium text-sm"
              placeholder="Min"
              placeholderTextColor="#ffffff50"
              keyboardType="numeric"
              value={minPrice}
              onChangeText={setMinPrice}
              style={{ paddingVertical: 0 }}
            />
          </View>
          <Text className="text-fdm-fg/40 font-semibold">to</Text>
          <View className="flex-1 h-11 bg-fdm-fg/5 border border-fdm-fg/10 rounded-xl px-3 justify-center">
            <TextInput
              className="text-fdm-fg font-medium text-sm"
              placeholder="Max"
              placeholderTextColor="#ffffff50"
              keyboardType="numeric"
              value={maxPrice}
              onChangeText={setMaxPrice}
              style={{ paddingVertical: 0 }}
            />
          </View>
        </View>
      </View>

      {/* Bedrooms */}
      <View className="mb-4 bg-fdm-fg/[0.03] border border-fdm-fg/10 rounded-2xl p-4">
        <View className="flex-row items-center gap-2 mb-3">
          <Ionicons name="bed-outline" size={16} color="#ccff00" />
          <Text className="text-fdm-fg/80 font-semibold">Bedrooms (Min)</Text>
        </View>
        <View className="flex-row flex-wrap gap-2.5">
          {BED_OPTIONS.map((num) => (
            <TouchableOpacity
              key={`bed-${num}`}
              onPress={() => setBedrooms(bedrooms === num ? null : num)}
              className={`w-11 h-11 rounded-xl items-center justify-center border ${
                bedrooms === num
                  ? "bg-fdm-accent/20 border-fdm-accent"
                  : "bg-fdm-fg/5 border-fdm-fg/10"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  bedrooms === num ? "text-fdm-accent" : "text-fdm-fg/70"
                }`}
              >
                {num}+
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bathrooms */}
      <View className="mb-4 bg-fdm-fg/[0.03] border border-fdm-fg/10 rounded-2xl p-4">
        <View className="flex-row items-center gap-2 mb-3">
          <Ionicons name="water-outline" size={16} color="#ccff00" />
          <Text className="text-fdm-fg/80 font-semibold">Bathrooms (Min)</Text>
        </View>
        <View className="flex-row flex-wrap gap-2.5">
          {BATH_OPTIONS.map((num) => (
            <TouchableOpacity
              key={`bath-${num}`}
              onPress={() => setBathrooms(bathrooms === num ? null : num)}
              className={`w-11 h-11 rounded-xl items-center justify-center border ${
                bathrooms === num
                  ? "bg-fdm-accent/20 border-fdm-accent"
                  : "bg-fdm-fg/5 border-fdm-fg/10"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  bathrooms === num ? "text-fdm-accent" : "text-fdm-fg/70"
                }`}
              >
                {num}+
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Source */}
      <View className="mb-10 bg-fdm-fg/[0.03] border border-fdm-fg/10 rounded-2xl p-4">
        <View className="flex-row items-center gap-2 mb-3">
          <Ionicons name="people-outline" size={16} color="#ccff00" />
          <Text className="text-fdm-fg/80 font-semibold">Source</Text>
        </View>
        <TouchableOpacity
          onPress={() => setSourceFilter(sourceFilter === "FDM" ? null : "FDM")}
          className={`flex-row items-center justify-between px-4 h-12 rounded-xl border ${
            sourceFilter === "FDM"
              ? "bg-fdm-accent/10 border-fdm-accent"
              : "bg-fdm-fg/5 border-fdm-fg/10"
          }`}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="briefcase-outline"
              size={16}
              color={sourceFilter === "FDM" ? "#ccff00" : "#ffffff99"}
            />
            <Text
              className={`font-bold ${
                sourceFilter === "FDM" ? "text-fdm-accent" : "text-fdm-fg/80"
              }`}
            >
              FDM (Colleagues Only)
            </Text>
          </View>
          {sourceFilter === "FDM" && (
            <Ionicons name="checkmark-circle" size={20} color="#ccff00" />
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
