
import { Dropdown } from "@/components/ui/Dropdown";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { BedDouble, Toilet } from "lucide-react-native";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

type FilterSidebarProps = {
  minPrice?: string | number | null;
  setMinPrice: (val: string) => void;
  maxPrice?: string | number | null;
  setMaxPrice: (val: string) => void;
  bedrooms?: number | null;
  setBedrooms: (val: number | null) => void;
  bathrooms?: number | null;
  setBathrooms: (val: number | null) => void;
  sourceFilter?: string | null;
  setSourceFilter: (val: string | null) => void;
  onClose?: () => void;
  onClearAll?: () => void;
};


const BED_OPTIONS = [1, 2, 3, 4, 5];
const BATH_OPTIONS = [1, 2, 3, 4, 5];

// -- Subcomponents --
const SectionHeader = ({ icon, label, right, style = {} }: { icon: React.ReactNode; label: string; right?: React.ReactNode; style?: any }) => (
  <View className="flex-row items-center gap-2 mb-4" style={style}>
    <View className="w-8 h-8 rounded-lg bg-fdm-accent/10 items-center justify-center">{icon}</View>
    <Text className="text-fdm-fg font-bold tracking-tight">{label}</Text>
    {right}
  </View>
);

const PriceInputRow = ({ minPrice, setMinPrice, maxPrice, setMaxPrice }: { minPrice?: string | number | null; setMinPrice: (val: string) => void; maxPrice?: string | number | null; setMaxPrice: (val: string) => void; }) => (
  <View className="flex-row items-center gap-4">
    <View className="flex-1 h-14 bg-fdm-fg/5 border border-fdm-fg/10 rounded-xl px-4 flex-row items-center">
      <Text className="text-fdm-fg/30 mr-2 text-sm">£</Text>
      <TextInput
        className="flex-1 text-fdm-fg font-medium text-base"
        placeholder="Min"
        placeholderTextColor="#ffffff20"
        keyboardType="numeric"
        value={minPrice != null ? String(minPrice) : ""}
        onChangeText={setMinPrice}
      />
    </View>
    <View className="w-4 h-0.5 bg-fdm-fg/10 rounded-full" />
    <View className="flex-1 h-14 bg-fdm-fg/5 border border-fdm-fg/10 rounded-xl px-4 flex-row items-center">
      <Text className="text-fdm-fg/30 mr-2 text-sm">£</Text>
      <TextInput
        className="flex-1 text-fdm-fg font-medium text-base"
        placeholder="Max"
        placeholderTextColor="#ffffff20"
        keyboardType="numeric"
        value={String(maxPrice || "")}
        onChangeText={setMaxPrice}
      />
    </View>
  </View>
);

const BedBathDropdownRow = ({ bedrooms, setBedrooms, bathrooms, setBathrooms }: { bedrooms?: number | null; setBedrooms: (val: number | null) => void; bathrooms?: number | null; setBathrooms: (val: number | null) => void; }) => (
  <View className="flex-row gap-4 items-center">
    <Dropdown<number | null>
      placeholder="Any"
      value={typeof bedrooms === 'number' ? bedrooms : null}
      options={[{ label: "Any", value: null }, ...BED_OPTIONS.map(num => ({ label: `${num}`, value: num }))]}
      onChange={setBedrooms}
    />
    <Dropdown<number | null>
      placeholder="Any"
      value={typeof bathrooms === 'number' ? bathrooms : null}
      options={[{ label: "Any", value: null }, ...BATH_OPTIONS.map(num => ({ label: `${num}`, value: num }))]}
      onChange={setBathrooms}
    />
  </View>
);

const SourceFilterOption = ({ sourceFilter, setSourceFilter }: { sourceFilter?: string | null; setSourceFilter: (val: string | null) => void; }) => (
  <TouchableOpacity
    onPress={() => setSourceFilter(sourceFilter === "FDM" ? null : "FDM")}
    className={`flex-row items-center justify-between px-6 h-20 rounded-xl border-2 ${sourceFilter === "FDM"
      ? "bg-fdm-accent/5 border-fdm-accent"
      : "bg-fdm-fg/5 border-fdm-fg/5"
      }`}
  >
    <View className="flex-row items-center gap-4">
      <View className={`w-12 items-center justify-center'}`}>
        <Image
          source={require("@assets/images/logo.svg")}
          style={{ width: 50, height: 30 }}
          tintColor={"#ccff00"}
          contentFit="contain"
        />
      </View>
      <View>
        <Text className={`ml-3 font-black text-base ${sourceFilter === "FDM" ? "text-fdm-accent" : "text-fdm-fg"}`}>
          Colleague Listed
        </Text>
      </View>
    </View>
    <Ionicons
      name={sourceFilter === "FDM" ? "checkmark-circle" : "radio-button-off"}
      size={24}
      color={sourceFilter === "FDM" ? "#ccff00" : "#ffffff20"}
    />
  </TouchableOpacity>
);

// -- Main Component --

const FilterSidebar = ({
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
}: FilterSidebarProps) => {
  return (
    <View className="flex-1 bg-fdm-bg">
      <View className="px-4 pt-4 pb-4 flex-row items-center justify-between border-b border-fdm-fg/5">
        <View>
          <Text className="text-2xl font-bold text-fdm-fg tracking-tight">
            Filters
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {onClearAll && (
            <TouchableOpacity onPress={onClearAll} className="mr-2">
              <Text className="text-fdm-accent text-sm font-bold uppercase tracking-wider">Reset</Text>
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

      <ScrollView className="flex-1 px-4 pt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* -- Price Range Section -- */}
        <View className="mb-4">
          <SectionHeader
            icon={<Ionicons name="cash-outline" size={16} color="#ccff00" />}
            label="Price Range"
            right={<Text className="text-fdm-fg/30 text-[10px] ml-auto uppercase font-bold tracking-tighter">Budget (£/mo)</Text>}
          />
          <PriceInputRow minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice} />
        </View>

        {/* -- Bedrooms & Bathrooms Section -- */}
        <View className="mb-8">
          <SectionHeader
            icon={<BedDouble size={16} color="#ccff00" />}
            label="Bedrooms"
            right={
              <>
                <View className="w-8 h-8 rounded-lg bg-fdm-accent/10 items-center justify-center ml-6">
                  <Toilet size={16} color="#ccff00" />
                </View>
                <Text className="text-fdm-fg font-bold tracking-tight ml-2">Bathrooms</Text>
              </>
            }
          />
          <BedBathDropdownRow bedrooms={bedrooms} setBedrooms={setBedrooms} bathrooms={bathrooms} setBathrooms={setBathrooms} />
        </View>

        {/* -- Source Section -- */}
        <View className="mb-6">
          <SectionHeader
            icon={<Ionicons name="shield-checkmark-outline" size={16} color="#ccff00" />}
            label="Verification"
          />
          <SourceFilterOption sourceFilter={sourceFilter} setSourceFilter={setSourceFilter} />
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* -- Apply Filter Button -- */}
      {onClose && (
        <View className="px-4 py-2 border-t border-fdm-fg/5 bg-fdm-bg items-end">
          <TouchableOpacity
            onPress={onClose}
            className="bg-fdm-accent h-10 px-6 rounded-xl items-center justify-center shadow-xl shadow-fdm-accent/20"
            style={{ alignSelf: 'flex-end' }}
          >
            <Text className="text-black font-black text-base tracking-widest uppercase">Apply</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default FilterSidebar;
