import FavouriteListingButton from "@components/listing/FavouriteListingButton";
import { Ionicons } from "@expo/vector-icons";
import { formatListingPrice } from "@utils/currency";
import { parsePhotoUrls } from "@utils/formatters";
import { forwardRef, useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, TouchableOpacityProps, View } from "react-native";

// listing card component
// shows the photo, price, location, beds and baths
import { Listing } from "@/types/views";

export type ListingCardData = Listing;

type ListingCardProps = {
    listing: ListingCardData;
    isFavourite?: boolean;
    onToggleFavourite?: () => void;
} & TouchableOpacityProps;

// colour + label config for each listing source
const SOURCE_CONFIG: Record<
    string,
    { label: string; color: string; bg: string; border: string }
> = {
    FDM: {
        label: "FDM",
        color: "#ccff00",
        bg: "rgba(10, 20, 0, 0.72)",
        border: "#ccff0060",
    },
    RIGHTMOVE: {
        label: "Rightmove",
        color: "#00e8c6",
        bg: "rgba(0, 20, 16, 0.72)",
        border: "#00e8c660",
    },
    OPENRENT: {
        label: "OpenRent",
        color: "#fb923c",
        bg: "rgba(30, 10, 0, 0.72)",
        border: "#fb923c60",
    },
    ZOOPLA: {
        label: "Zoopla",
        color: "#c4b5fd",
        bg: "rgba(15, 8, 30, 0.72)",
        border: "#c4b5fd60",
    },
};

const ListingCard = forwardRef<View, ListingCardProps>(({ listing, isFavourite, onToggleFavourite, onPress, ...props }, ref) => {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        const photos = parsePhotoUrls(listing.mediaUrls);
        setPhotoUrl(photos.length > 0 ? photos[0] : null);
    }, [listing.mediaUrls]);

    const src = listing.source ?? "FDM";
    const sourceConfig = SOURCE_CONFIG[src] ?? SOURCE_CONFIG.FDM;

    return (
        <View>
            <TouchableOpacity
                ref={ref}
                onPress={onPress}
                className="bg-fdm-fg/5 rounded-3xl overflow-hidden active:opacity-80"
                style={src === "FDM" ? {
                    borderWidth: 1.5,
                    borderColor: "#ccff0070",
                } : {
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                }}
                {...props}
            >
                {/* primary photo thumbnail */}
                <View className="h-40 bg-fdm-fg/10 items-center justify-center w-full overflow-hidden">
                    {photoUrl ? (
                        <Image
                            key={photoUrl}
                            source={{ uri: photoUrl }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                    ) : (
                        <Ionicons name="home" size={40} color="#ccff0030" />
                    )}

                    {/* Source Badge — top-right overlay on photo */}
                    <View
                        style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            backgroundColor: sourceConfig.bg,
                            borderWidth: 1,
                            borderColor: sourceConfig.border,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 20,
                            shadowColor: sourceConfig.color,
                            shadowOpacity: 0.6,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 2 },
                            elevation: 6,
                        }}
                    >
                        <Text
                            style={{
                                color: sourceConfig.color,
                                fontSize: 11,
                                fontWeight: "700",
                                letterSpacing: 0.5,
                            }}
                        >
                            {sourceConfig.label}
                        </Text>
                    </View>

                    {/* Favourite Button (Top Left) */}
                    {onToggleFavourite && (
                        <FavouriteListingButton
                            toggleFavourite={onToggleFavourite}
                            isFavourite={isFavourite}
                            stopPropagation
                            style={{
                                position: "absolute",
                                top: 10,
                                left: 10,
                            }}
                        />
                    )}
                </View>
                {/* listing details */}
                <View className="p-4">
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-2">
                            <Text className="text-fdm-fg font-bold text-base">
                                {listing.title}
                            </Text>
                            <View className="flex-row items-center mt-1 gap-1">
                                <Ionicons
                                    name="location-outline"
                                    size={13}
                                    color="#ffffff60"
                                />
                                <Text className="text-fdm-fg/50 text-xs">
                                    {listing.address || "Unknown location"}
                                </Text>
                            </View>
                        </View>
                        <View className="bg-fdm-accent/10 border border-fdm-accent/20 px-3 py-1 rounded-xl">
                            <Text className="text-fdm-accent font-bold text-sm">
                                {formatListingPrice(listing.price, listing.rentPeriod)}
                            </Text>
                        </View>
                    </View>
                    {/* beds and baths row */}
                    <View className="flex-row gap-4 mt-3 pt-3 border-t border-fdm-fg/10">
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="bed-outline" size={14} color="#ffffff50" />
                            <Text className="text-fdm-fg/50 text-xs">
                                {listing.bedrooms} bed
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="water-outline" size={14} color="#ffffff50" />
                            <Text className="text-fdm-fg/50 text-xs">
                                {listing.bathrooms} bath
                            </Text>
                        </View>

                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
});

ListingCard.displayName = "ListingCard";

export default ListingCard;
