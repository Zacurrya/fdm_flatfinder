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
  onClearAll?: () => void;
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
  onClearAll,
}: FilterSidebarProps) {
  return (
    <View className="flex-1 bg-fdm-bg">
      <View className="px-6 pt-8 pb-4 flex-row items-center justify-between border-b border-fdm-fg/5">
        <View>
          <Text className="text-2xl font-bold text-fdm-fg tracking-tight" style={{ fontFamily: "Michroma_400Regular" }}>
            Filters
          </Text>
          <Text className="text-fdm-fg/40 text-xs mt-1 font-medium italic">Refine your search</Text>
        </View>
        <View className="flex-row items-center gap-2">
          {onClearAll && (
            <TouchableOpacity onPress={onClearAll} className="mr-2">
              <Text className="text-fdm-accent text-xs font-bold uppercase tracking-wider">Reset</Text>
            </TouchableOpacity>
          )}
          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center bg-fdm-fg/10 rounded-full"
            >
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Price Range Section */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-8 h-8 rounded-lg bg-fdm-accent/10 items-center justify-center">
              <Ionicons name="cash-outline" size={16} color="#ccff00" />
            </View>
            <Text className="text-fdm-fg font-bold tracking-tight">Price Range</Text>
            <Text className="text-fdm-fg/30 text-[10px] ml-auto uppercase font-bold tracking-tighter">Budget (£/mo)</Text>
          </View>

          <View className="flex-row items-center gap-4">
            <View className="flex-1 h-14 bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl px-4 flex-row items-center">
              <Text className="text-fdm-fg/30 mr-2 text-sm">£</Text>
              <TextInput
                className="flex-1 text-fdm-fg font-medium text-base"
                placeholder="Min"
                placeholderTextColor="#ffffff20"
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
              />
            </View>
            <View className="w-4 h-0.5 bg-fdm-fg/10 rounded-full" />
            <View className="flex-1 h-14 bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl px-4 flex-row items-center">
              <Text className="text-fdm-fg/30 mr-2 text-sm">£</Text>
              <TextInput
                className="flex-1 text-fdm-fg font-medium text-base"
                placeholder="Max"
                placeholderTextColor="#ffffff20"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>
          </View>
        </View>

        {/* Bedrooms Section */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-8 h-8 rounded-lg bg-fdm-accent/10 items-center justify-center">
              <Ionicons name="bed-outline" size={16} color="#ccff00" />
            </View>
            <Text className="text-fdm-fg font-bold tracking-tight">Bedrooms</Text>
            <Text className="text-fdm-fg/30 text-[10px] ml-auto uppercase font-bold tracking-tighter">Minimum</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
            {BED_OPTIONS.map((num) => {
              const active = bedrooms === num;
              return (
                <TouchableOpacity
                  key={`bed-${num}`}
                  onPress={() => setBedrooms(active ? null : num)}
                  className={`w-14 h-14 rounded-2xl items-center justify-center border-2 transition-all ${active
                      ? "bg-fdm-accent border-fdm-accent"
                      : "bg-fdm-fg/5 border-fdm-fg/5"
                    }`}
                >
                  <Text
                    className={`text-base font-black ${active ? "text-[#151515]" : "text-fdm-fg/60"
                      }`}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Bathrooms Section */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-8 h-8 rounded-lg bg-fdm-accent/10 items-center justify-center">
              <Ionicons name="water-outline" size={16} color="#ccff00" />
            </View>
            <Text className="text-fdm-fg font-bold tracking-tight">Bathrooms</Text>
            <Text className="text-fdm-fg/30 text-[10px] ml-auto uppercase font-bold tracking-tighter">Minimum</Text>
          </View>

          <View className="flex-row gap-3">
            {BATH_OPTIONS.map((num) => {
              const active = bathrooms === num;
              return (
                <TouchableOpacity
                  key={`bath-${num}`}
                  onPress={() => setBathrooms(active ? null : num)}
                  className={`flex-1 h-14 rounded-2xl items-center justify-center border-2 ${active
                      ? "bg-fdm-accent border-fdm-accent"
                      : "bg-fdm-fg/5 border-fdm-fg/5"
                    }`}
                >
                  <Text
                    className={`text-base font-black ${active ? "text-[#151515]" : "text-fdm-fg/60"
                      }`}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Source Section */}
        <View className="mb-12">
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-8 h-8 rounded-lg bg-fdm-accent/10 items-center justify-center">
              <Ionicons name="shield-checkmark-outline" size={16} color="#ccff00" />
            </View>
            <Text className="text-fdm-fg font-bold tracking-tight">Verification</Text>
          </View>

          <TouchableOpacity
            onPress={() => setSourceFilter(sourceFilter === "FDM" ? null : "FDM")}
            className={`flex-row items-center justify-between px-6 h-20 rounded-3xl border-2 ${sourceFilter === "FDM"
                ? "bg-fdm-accent/5 border-fdm-accent"
                : "bg-fdm-fg/5 border-fdm-fg/5"
              }`}
          >
            <View className="flex-row items-center gap-4">
              <View className={`w-10 h-10 rounded-full items-center justify-center ${sourceFilter === "FDM" ? 'bg-fdm-accent' : 'bg-fdm-fg/10'}`}>
                <Ionicons
                  name="briefcase"
                  size={18}
                  color={sourceFilter === "FDM" ? "#151515" : "#ffffff40"}
                />
              </View>
              <View>
                <Text className={`font-black text-base ${sourceFilter === "FDM" ? "text-fdm-accent" : "text-fdm-fg"}`}>
                  Exclusively FDM
                </Text>
                <Text className="text-fdm-fg/40 text-[10px] font-bold uppercase tracking-widest mt-1">Colleagues only</Text>
              </View>
            </View>
            <Ionicons
              name={sourceFilter === "FDM" ? "checkmark-circle" : "radio-button-off"}
              size={24}
              color={sourceFilter === "FDM" ? "#ccff00" : "#ffffff20"}
            />
          </TouchableOpacity>
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Apply Button Overlay */}
      {onClose && (
        <View className="px-6 py-6 border-t border-fdm-fg/5 bg-fdm-bg">
          <TouchableOpacity
            onPress={onClose}
            className="bg-fdm-accent h-16 rounded-2xl items-center justify-center shadow-xl shadow-fdm-accent/20"
          >
            <Text className="text-black font-black text-lg tracking-widest uppercase">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
