import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export type ListingCardData = {
    id: number;
    title: string;
    location: string;
    price: string;
    beds: number;
    baths: number;
};

type ListingCardProps = {
    listing: ListingCardData;
    onPress?: () => void;
};

export default function ListingCard({ listing, onPress }: ListingCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-fdm-fg/5 border border-fdm-fg/10 rounded-3xl overflow-hidden active:opacity-80"
        >
            {/* Placeholder image band */}
            <View className="h-40 bg-fdm-fg/10 items-center justify-center">
                <Ionicons name="home" size={40} color="#ccff0030" />
            </View>

            <View className="p-4">
                <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                        <Text className="text-fdm-fg font-bold text-base">{listing.title}</Text>
                        <View className="flex-row items-center mt-1 gap-1">
                            <Ionicons name="location-outline" size={13} color="#ffffff60" />
                            <Text className="text-fdm-fg/50 text-xs">{listing.location}</Text>
                        </View>
                    </View>
                    <View className="bg-fdm-accent/10 border border-fdm-accent/20 px-3 py-1 rounded-xl">
                        <Text className="text-fdm-accent font-bold text-sm">{listing.price}</Text>
                    </View>
                </View>

                <View className="flex-row gap-4 mt-3 pt-3 border-t border-fdm-fg/10">
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="bed-outline" size={14} color="#ffffff50" />
                        <Text className="text-fdm-fg/50 text-xs">{listing.beds} bed</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="water-outline" size={14} color="#ffffff50" />
                        <Text className="text-fdm-fg/50 text-xs">{listing.baths} bath</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="people-outline" size={14} color="#ffffff50" />
                        <Text className="text-fdm-fg/50 text-xs">FDMers nearby</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
