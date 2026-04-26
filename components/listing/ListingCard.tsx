import FavouriteListingButton from "@components/listing/FavouriteListingButton";
import { Ionicons } from "@expo/vector-icons";
import { formatListingPrice } from "@utils/currency";
import { parsePhotoUrls } from "@utils/formatters";
import { Image } from "expo-image";
import { router } from "expo-router";
import { BedDouble, Toilet } from "lucide-react-native";
import { memo, useEffect, useState } from "react";
import { Text, TouchableOpacity, TouchableOpacityProps, View } from "react-native";

// listing card component
// shows the photo, price, location, beds and baths
import { ListingRecord } from "@/types/records";

export type ListingCardData = ListingRecord;

type ListingCardProps = {
    listing: ListingCardData;
    isFavourite?: boolean;
    onToggleFavourite?: () => void;
} & TouchableOpacityProps;

// colour + label config for each listing source

// TEMPORARY: PropertyGuru source for Singapore listings (red color)
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
    PROPERTYGURU: {
        label: "PropertyGuru",
        color: "#ef4444", // red
        bg: "rgba(239, 68, 68, 0.15)",
        border: "#ef444460",
    },
};

const ListingCard = memo(({ listing, isFavourite, onToggleFavourite, ...props }: ListingCardProps) => {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        const photos = parsePhotoUrls(listing.mediaUrls);
        setPhotoUrl(photos.length > 0 ? photos[0] : null);
    }, [listing.mediaUrls]);

    const src = listing.source ?? "FDM";
    const sourceConfig = SOURCE_CONFIG[src] ?? SOURCE_CONFIG.FDM;

    const onPress = () => {
        router.push(`/listing/${listing.id}`);
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-fdm-fg/5 rounded-3xl active:opacity-80"
            style={{
                shadowColor: sourceConfig.color,
                shadowOpacity: 0.3,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
                borderWidth: 1.5,
                borderColor: sourceConfig.color + "40",
            }}
            {...props}
        >
            {/* primary photo thumbnail */}
            <View
                className="h-40 bg-fdm-fg/10 items-center justify-center w-full overflow-hidden"
                style={{ borderTopLeftRadius: 22, borderTopRightRadius: 22 }}
            >
                {photoUrl ? (
                    <Image
                        key={photoUrl}
                        source={{ uri: photoUrl }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
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
                        backgroundColor: src === 'FDM' ? 'transparent' : sourceConfig.bg,
                        borderWidth: src === 'FDM' ? 0 : 1,
                        borderColor: sourceConfig.border,
                        paddingHorizontal: src === 'FDM' ? 0 : 10,
                        paddingVertical: src === 'FDM' ? 0 : 4,
                        borderRadius: 20,
                        shadowColor: sourceConfig.color,
                        shadowOpacity: src === 'FDM' ? 0 : 0.6,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: src === 'FDM' ? 0 : 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {src === 'FDM' ? (
                        <Image
                            source={require("@assets/images/logo.svg")}
                            style={{ width: 44, height: 22 }}
                            tintColor={"#ccff00"}
                            contentFit="contain"
                        />

                    ) : (
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
                    )}
                </View>

                {/* Favourite Button (Top Left) */}
                {onToggleFavourite && (
                    <FavouriteListingButton
                        toggleFavourite={onToggleFavourite}
                        isFavourite={isFavourite ?? listing.isSaved}
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
                        <BedDouble size={16} color="#ffffff50" />
                        <Text className="text-fdm-fg/50 text-xs">
                            {listing.bedrooms} {listing.bedrooms === 1 ? "bedroom" : "bedrooms"}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <Toilet size={16} color="#ffffff50" />
                        <Text className="text-fdm-fg/50 text-xs">
                            {listing.bathrooms} {listing.bathrooms === 1 ? "bathroom" : "bathrooms"}
                        </Text>
                    </View>

                </View>
            </View>
        </TouchableOpacity>
    );
});

ListingCard.displayName = "ListingCard";

export default ListingCard;
