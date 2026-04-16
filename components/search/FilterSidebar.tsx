import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

const SOURCES = ["FDM", "RIGHTMOVE", "OPENRENT", "ZOOPLA"];
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
    <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center justify-between mb-8">
        <Text className="text-xl font-bold text-fdm-fg" style={{ fontFamily: "Michroma_400Regular" }}>
          Filters
        </Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} className="p-2 bg-fdm-fg/5 rounded-full active:opacity-70">
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Price Range */}
      <View className="mb-6">
        <Text className="text-fdm-fg/70 font-semibold mb-3">Price Range (£ per month)</Text>
        <View className="flex-row items-center gap-3">
          <View className="flex-1 bg-fdm-fg/5 border border-fdm-fg/10 rounded-xl px-4 py-3">
            <TextInput
              className="text-fdm-fg font-medium"
              placeholder="Min"
              placeholderTextColor="#ffffff50"
              keyboardType="numeric"
              value={minPrice}
              onChangeText={setMinPrice}
            />
          </View>
          <Text className="text-fdm-fg/50">-</Text>
          <View className="flex-1 bg-fdm-fg/5 border border-fdm-fg/10 rounded-xl px-4 py-3">
            <TextInput
              className="text-fdm-fg font-medium"
              placeholder="Max"
              placeholderTextColor="#ffffff50"
              keyboardType="numeric"
              value={maxPrice}
              onChangeText={setMaxPrice}
            />
          </View>
        </View>
      </View>

      {/* Bedrooms */}
      <View className="mb-6">
        <Text className="text-fdm-fg/70 font-semibold mb-3">Bedrooms (Min)</Text>
        <View className="flex-row flex-wrap gap-2">
          {BED_OPTIONS.map((num) => (
            <TouchableOpacity
              key={`bed-${num}`}
              onPress={() => setBedrooms(bedrooms === num ? null : num)}
              className={`w-12 h-12 rounded-xl items-center justify-center border ${
                bedrooms === num
                  ? "bg-fdm-accent/20 border-fdm-accent"
                  : "bg-fdm-fg/5 border-fdm-fg/10"
              }`}
            >
              <Text
                className={`font-bold ${
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
      <View className="mb-6">
        <Text className="text-fdm-fg/70 font-semibold mb-3">Bathrooms (Min)</Text>
        <View className="flex-row flex-wrap gap-2">
          {BATH_OPTIONS.map((num) => (
            <TouchableOpacity
              key={`bath-${num}`}
              onPress={() => setBathrooms(bathrooms === num ? null : num)}
              className={`w-12 h-12 rounded-xl items-center justify-center border ${
                bathrooms === num
                  ? "bg-fdm-accent/20 border-fdm-accent"
                  : "bg-fdm-fg/5 border-fdm-fg/10"
              }`}
            >
              <Text
                className={`font-bold ${
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
      <View className="mb-10">
        <Text className="text-fdm-fg/70 font-semibold mb-3">Source</Text>
        <View className="gap-2">
          {SOURCES.map((source) => (
            <TouchableOpacity
              key={source}
              onPress={() => setSourceFilter(sourceFilter === source ? null : source)}
              className={`flex-row items-center justify-between px-4 py-3 rounded-xl border ${
                sourceFilter === source
                  ? "bg-fdm-accent/10 border-fdm-accent"
                  : "bg-fdm-fg/5 border-fdm-fg/10"
              }`}
            >
              <Text
                className={`font-bold ${
                  sourceFilter === source ? "text-fdm-accent" : "text-fdm-fg/80"
                }`}
              >
                {source === "FDM" ? "FDM (Internal)" : source.charAt(0) + source.slice(1).toLowerCase()}
              </Text>
              {sourceFilter === source && (
                <Ionicons name="checkmark-circle" size={20} color="#ccff00" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
