import { Listing } from "@/types/views";
import { formatListingPrice } from "@utils/currency";
import { parsePhotoUrls } from "@utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { forwardRef, useEffect, useState } from "react";
import { Text, TouchableOpacity, TouchableOpacityProps, View } from "react-native";

export type SavedListingCardData = Listing;

type SavedListingCardProps = {
    listing: SavedListingCardData;
} & TouchableOpacityProps;

const SavedListingCard = forwardRef<View, SavedListingCardProps>(({ listing, onPress, ...props }, ref) => {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        const photos = parsePhotoUrls(listing.mediaUrls);
        setPhotoUrl(photos.length > 0 ? photos[0] : null);
    }, [listing.mediaUrls]);

    return (
        <TouchableOpacity
            ref={ref}
            onPress={onPress}
            className="bg-fdm-fg/5 rounded-2xl overflow-hidden active:opacity-80 w-48 mr-4"
            style={{
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.05)",
            }}
            {...props}
        >
            {/* thumbnail */}
            <View className="h-32 bg-fdm-fg/10 items-center justify-center w-full overflow-hidden">
                {photoUrl ? (
                    <Image
                        source={{ uri: photoUrl }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={200}
                    />
                ) : (
                    <Ionicons name="home" size={24} color="#ccff0030" />
                )}
                
                {/* Source Badge */}
                <View className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-lg">
                    <Text className="text-white text-[10px] font-bold">{listing.source ?? "FDM"}</Text>
                </View>
            </View>
            
            {/* details */}
            <View className="p-3">
                <Text className="text-fdm-fg font-bold text-sm" numberOfLines={1}>
                    {listing.title}
                </Text>
                <View className="flex-row items-center mt-1 mb-2 gap-1">
                    <Ionicons name="location-outline" size={12} color="#ffffff60" />
                    <Text className="text-fdm-fg/50 text-xs" numberOfLines={1}>
                        {listing.address || "Unknown location"}
                    </Text>
                </View>
                <Text className="text-fdm-accent font-bold text-sm">
                    {formatListingPrice(listing.price, listing.rentPeriod)}
                </Text>
            </View>
        </TouchableOpacity>
    );
});

SavedListingCard.displayName = "SavedListingCard";

export default SavedListingCard;
