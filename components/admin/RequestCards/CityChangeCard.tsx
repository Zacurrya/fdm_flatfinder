import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import ActionButtons from "./ActionButtons";
import { StatusBadge } from "./StatusBadge";
import { RequestCardProps } from "./types";

export const CityChangeCard = ({ request, isProcessing, onApprove, onReject }: RequestCardProps) => {
    const displayName =
        request.userFirstName && request.userLastName
            ? `${request.userFirstName} ${request.userLastName}`
            : null;

    return (
        <View className="bg-fdm-fg/5 border border-fdm-fg/10 rounded-3xl p-5 mb-4">
            {/* -- Header -- */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                    <Ionicons name="swap-horizontal-outline" size={13} color="#ffffff50" />
                    <Text className="text-fdm-fg/40 text-xs font-semibold uppercase tracking-wider">
                        City Change
                    </Text>
                </View>
                <StatusBadge status={request.status} />
            </View>

            {/* -- User Info -- */}
            <View className="gap-1.5 mb-4 pl-1">
                {displayName && (
                    <Text className="text-fdm-fg font-bold text-base">{displayName}</Text>
                )}
                {request.userEmail && (
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="mail-outline" size={13} color="#ffffff50" />
                        <Text className="text-fdm-fg/60 text-sm">{request.userEmail}</Text>
                    </View>
                )}
            </View>

            {/* -- City Change Details -- */}
            <View className="flex-row items-center gap-3 bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl px-4 py-3">
                <View className="flex-1">
                    <Text className="text-fdm-fg/40 text-[10px] uppercase tracking-wider mb-1">Current</Text>
                    <Text className="text-fdm-fg/80 text-sm font-medium">
                        {request.oldCity || "Unknown"}
                    </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#ccff00" />
                <View className="flex-1 items-end">
                    <Text className="text-fdm-accent/50 text-[10px] uppercase tracking-wider mb-1">Requested</Text>
                    <Text className="text-fdm-accent font-bold text-sm">
                        {request.newCity || "Unknown"}
                    </Text>
                </View>
            </View>

            {/* Footer meta */}
            <View className="flex-row items-center gap-1.5 mt-3 pl-1">
                <Ionicons name="time-outline" size={12} color="#ffffff40" />
                <Text className="text-fdm-fg/30 text-xs">
                    {new Date(request.createdAt).toLocaleDateString()}
                </Text>
                {!request.status.includes("PENDING") && request.reviewerEmail && (
                    <>
                        <Text className="text-fdm-fg/20 text-xs mx-1">·</Text>
                        <Ionicons name="shield-checkmark-outline" size={12} color="#ffffff40" />
                        <Text className="text-fdm-fg/30 text-xs">
                            {request.reviewerEmail}
                        </Text>
                    </>
                )}
            </View>

            {request.status === "PENDING" && (
                <ActionButtons
                    request={request}
                    isProcessing={isProcessing}
                    onApprove={onApprove}
                    onReject={onReject}
                />
            )}
        </View>
    );
}
