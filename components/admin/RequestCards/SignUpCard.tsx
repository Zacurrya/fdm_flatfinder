import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import ActionButtons from "./ActionButtons";
import { StatusBadge } from "./StatusBadge";
import { RequestCardProps } from "./types";

export const SignUpCard = ({ request, isProcessing, onApprove, onReject }: RequestCardProps) => {
    const displayName = `${request.userFirstName} ${request.userLastName}`

    return (
        <View className="bg-fdm-fg/5 border border-fdm-fg/10 rounded-3xl p-5 mb-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3 flex-1">
                    <View className="flex-1">
                        <Text className="text-fdm-fg font-bold text-base">{displayName}</Text>
                        <View className="flex-row items-center gap-1.5 mt-0.5">
                            <Ionicons name="person-add-outline" size={11} color="#ffffff50" />
                            <Text className="text-fdm-fg/40 text-xs">Sign Up</Text>
                        </View>
                    </View>
                </View>
                <StatusBadge status={request.status} />
            </View>

            {/* Details */}
            <View className="gap-2 pl-1">
                {request.userEmail && (
                    <View className="flex-row items-center gap-2.5">
                        <Ionicons name="mail-outline" size={14} color="#ffffff60" />
                        <Text className="text-fdm-fg/70 text-sm">{request.userEmail}</Text>
                    </View>
                )}
                {request.newCity && (
                    <View className="flex-row items-center gap-2.5">
                        <Ionicons name="location-outline" size={14} color="#ffffff60" />
                        <Text className="text-fdm-fg/70 text-sm">{request.newCity}</Text>
                    </View>
                )}
                <View className="flex-row items-center gap-2.5">
                    <Ionicons name="time-outline" size={14} color="#ffffff60" />
                    <Text className="text-fdm-fg/40 text-xs">
                        {new Date(request.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                {!request.status.includes("PENDING") && request.reviewerEmail && (
                    <View className="flex-row items-center gap-2.5 mt-1">
                        <Ionicons name="shield-checkmark-outline" size={14} color="#ffffff60" />
                        <Text className="text-fdm-fg/40 text-xs">
                            Reviewed by {request.reviewerEmail}
                            {request.reviewedAt ? ` · ${new Date(request.reviewedAt).toLocaleDateString()}` : ""}
                        </Text>
                    </View>
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
