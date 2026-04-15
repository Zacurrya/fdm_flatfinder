import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";

// Listing Card Component

// this is the card that shows up on the home page for each flat
// shows the photo, price, location, beds and baths

// data we need from the listing to display on the card
export type ListingCardData = {
    id: number | string;
    title: string;
    location: string;
    price: number | string;
    rentPeriod?: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
    photos?: string[] | null;
    beds?: number;
    baths?: number;
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
            {/* Primary Photo Thumbnail */}
            <View className="h-40 bg-fdm-fg/10 items-center justify-center w-full overflow-hidden">
                {listing.photos && listing.photos.length > 0 ? (
                    <Image 
                        source={{ uri: listing.photos[0] }} 
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={200}
                    />
                ) : (
                    <Ionicons name="home" size={40} color="#ccff0030" />
                )}
            </View>

            <View className="p-4">
                <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-2">
                        <Text className="text-fdm-fg font-bold text-base">{listing.title}</Text>
                        <View className="flex-row items-center mt-1 gap-1">
                            <Ionicons name="location-outline" size={13} color="#ffffff60" />
                            <Text className="text-fdm-fg/50 text-xs">{listing.location}</Text>
                        </View>
                    </View>
                    <View className="bg-fdm-accent/10 border border-fdm-accent/20 px-3 py-1 rounded-xl">
                        <Text className="text-fdm-accent font-bold text-sm">
                            £{listing.price}/{listing.rentPeriod === "WEEKLY" ? "wk" : listing.rentPeriod === "BIWEEKLY" ? "biwk" : "mo"}
                        </Text>
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
