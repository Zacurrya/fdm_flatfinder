import AwaitingApprovalView from "@/components/ui/AwaitingApprovalView";
import ListingCard from "@/components/ui/ListingCard";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { searchListings, Listing } from "../../../services/listings/listingsService";

const PROPERTY_TYPES = ["FLAT", "STUDIO", "TERRACEDHOUSE", "SEMIDETACHED", "DETACHED"];
const RENT_PERIODS = ["WEEKLY", "BIWEEKLY", "MONTHLY"];
const RENT_PERIOD_LABELS: Record<string, string> = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Bi-Weekly",
  MONTHLY: "Monthly",
};
const TYPE_LABELS: Record<string, string> = {
  FLAT: "Flat",
  STUDIO: "Studio",
  TERRACEDHOUSE: "Terraced",
  SEMIDETACHED: "Semi-Det.",
  DETACHED: "Detached",
};

export default function SearchScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds] = useState<number | undefined>(undefined);
  const [baths, setBaths] = useState<number | undefined>(undefined);
  const [propertyType, setPropertyType] = useState<string | undefined>(undefined);
  const [rentPeriod, setRentPeriod] = useState<string | undefined>(undefined);

  const [results, setResults] = useState<Listing[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user?.approvalStatus === "PENDING" || user?.approvalStatus === "REJECTED") {
    return (
      <AwaitingApprovalView
        title={user.approvalStatus === "REJECTED" ? "Account Denied" : "Awaiting Admin Approval"}
        message={
          user.approvalStatus === "REJECTED"
            ? "Your account has been denied. Please contact an administrator for more information."
            : "Your account is awaiting admin approval."
        }
      />
    );
  }

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchListings({
        location: location.trim() || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        beds,
        baths,
        propertyType,
        rentPeriod,
      });
      setResults(data);
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setBeds(undefined);
    setBaths(undefined);
    setPropertyType(undefined);
    setRentPeriod(undefined);
    setResults([]);
    setSearched(false);
  };

  const Counter = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number | undefined;
    onChange: (v: number | undefined) => void;
  }) => (
    <View className="flex-1">
      <Text className="text-fdm-fg/60 text-xs mb-2">{label}</Text>
      <View className="flex-row items-center bg-fdm-fg/5 border border-fdm-fg/10 rounded-xl overflow-hidden">
        <TouchableOpacity
          className="px-3 py-2.5"
          onPress={() => onChange(value && value > 1 ? value - 1 : undefined)}
        >
          <Text className="text-fdm-fg/70 text-base font-bold">−</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-fdm-fg font-semibold">
          {value ?? "Any"}
        </Text>
        <TouchableOpacity
          className="px-3 py-2.5"
          onPress={() => onChange((value ?? 0) + 1)}
        >
          <Text className="text-fdm-accent text-base font-bold">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* header */}
        <View className="pt-14 pb-2 px-6">
          <Text className="text-fdm-fg text-3xl font-bold tracking-tight">Search</Text>
          <Text className="text-fdm-fg/40 text-sm mt-1">Filter listings by your requirements</Text>
        </View>

        {/* filters */}
        <View className="px-6 gap-4 pb-4">
          {/* location */}
          <View>
            <Text className="text-fdm-fg/60 text-xs mb-2">Location</Text>
            <View className="flex-row items-center bg-fdm-fg/5 border border-fdm-fg/10 rounded-xl px-4">
              <Ionicons name="location-outline" size={16} color="#ffffff50" />
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. East London"
                placeholderTextColor="#ffffff30"
                className="flex-1 text-fdm-fg py-3 ml-2"
              />
            </View>
          </View>

          {/* price range */}
          <View>
            <Text className="text-fdm-fg/60 text-xs mb-2">Price Range (£)</Text>
            <View className="flex-row gap-3">
              <TextInput
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
                placeholder="Min"
                placeholderTextColor="#ffffff30"
                className="flex-1 bg-fdm-fg/5 border border-fdm-fg/10 rounded-xl px-4 py-3 text-fdm-fg"
              />
              <TextInput
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
                placeholder="Max"
                placeholderTextColor="#ffffff30"
                className="flex-1 bg-fdm-fg/5 border border-fdm-fg/10 rounded-xl px-4 py-3 text-fdm-fg"
              />
            </View>
          </View>

          {/* beds / baths */}
          <View className="flex-row gap-3">
            <Counter label="Bedrooms" value={beds} onChange={setBeds} />
            <Counter label="Bathrooms" value={baths} onChange={setBaths} />
          </View>

          {/* rent period */}
          <View>
            <Text className="text-fdm-fg/60 text-xs mb-2">Rent Period</Text>
            <View className="flex-row gap-2 flex-wrap">
              {RENT_PERIODS.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setRentPeriod(rentPeriod === p ? undefined : p)}
                  className={`px-4 py-2 rounded-xl border ${
                    rentPeriod === p
                      ? "bg-fdm-accent/20 border-fdm-accent"
                      : "bg-fdm-fg/5 border-fdm-fg/10"
                  }`}
                >
                  <Text className={rentPeriod === p ? "text-fdm-accent font-bold text-sm" : "text-fdm-fg/60 text-sm"}>
                    {RENT_PERIOD_LABELS[p]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* property type */}
          <View>
            <Text className="text-fdm-fg/60 text-xs mb-2">Property Type</Text>
            <View className="flex-row gap-2 flex-wrap">
              {PROPERTY_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setPropertyType(propertyType === t ? undefined : t)}
                  className={`px-4 py-2 rounded-xl border ${
                    propertyType === t
                      ? "bg-fdm-accent/20 border-fdm-accent"
                      : "bg-fdm-fg/5 border-fdm-fg/10"
                  }`}
                >
                  <Text className={propertyType === t ? "text-fdm-accent font-bold text-sm" : "text-fdm-fg/60 text-sm"}>
                    {TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* action buttons */}
          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              onPress={handleSearch}
              disabled={loading}
              className="flex-1 bg-fdm-accent py-3.5 rounded-2xl items-center"
            >
              {loading ? (
                <ActivityIndicator color="#1a1a1a" />
              ) : (
                <Text className="text-fdm-bg font-bold">Search</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReset}
              className="px-5 py-3.5 rounded-2xl border border-fdm-fg/10 items-center"
            >
              <Text className="text-fdm-fg/60 font-semibold">Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* results */}
        {searched && (
          <View className="px-6 pb-8">
            <Text className="text-fdm-fg/50 text-sm mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </Text>
            {results.length === 0 ? (
              <View className="items-center py-10">
                <Ionicons name="search-outline" size={48} color="#ffffff15" />
                <Text className="text-fdm-fg/30 text-sm mt-3">No listings match your filters.</Text>
              </View>
            ) : (
              <View className="gap-4">
                {results.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onPress={() => router.push(`/listing/${listing.id}`)}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
