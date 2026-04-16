import { Ionicons } from "@expo/vector-icons";
import { RequestRecord } from "@services/requests/requestTypes";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type RequestCardProps = {
    request: RequestRecord;
    isProcessing: boolean;
    onApprove: (request: RequestRecord) => void;
    onReject: (request: RequestRecord) => void;
};

function StatusBadge({ status }: { status: string }) {
    const config =
        status === "PENDING"
            ? { bg: "bg-yellow-500/15", border: "border-yellow-500/25", text: "text-yellow-400", label: "Pending" }
            : status === "APPROVED"
                ? { bg: "bg-emerald-500/15", border: "border-emerald-500/25", text: "text-emerald-400", label: "Approved" }
                : { bg: "bg-red-500/15", border: "border-red-500/25", text: "text-red-400", label: "Rejected" };

    return (
        <View className={`${config.bg} border ${config.border} px-3 py-1 rounded-xl`}>
            <Text className={`${config.text} text-xs font-semibold uppercase`}>{config.label}</Text>
        </View>
    );
}

function ActionButtons({
    request,
    isProcessing,
    onApprove,
    onReject,
}: Pick<RequestCardProps, "request" | "isProcessing" | "onApprove" | "onReject">) {
    return (
        <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
                className="flex-1 bg-fdm-accent py-3 rounded-2xl items-center active:opacity-80"
                onPress={() => onApprove(request)}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <ActivityIndicator color="#1b1b1b" size="small" />
                ) : (
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="checkmark-circle-outline" size={17} color="#1b1b1b" />
                        <Text className="text-fdm-bg font-bold text-sm">Approve</Text>
                    </View>
                )}
            </TouchableOpacity>
            <TouchableOpacity
                className="flex-1 bg-red-500/15 border border-red-500/25 py-3 rounded-2xl items-center active:opacity-80"
                onPress={() => onReject(request)}
                disabled={isProcessing}
            >
                <View className="flex-row items-center gap-2">
                    <Ionicons name="close-circle-outline" size={17} color="#ef4444" />
                    <Text className="text-red-400 font-bold text-sm">Reject</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

// Sign Up Card

function SignUpCard({ request, isProcessing, onApprove, onReject }: RequestCardProps) {
    const displayName =
        request.userFirstName && request.userLastName
            ? `${request.userFirstName} ${request.userLastName}`
            : request.userEmail ?? "Unknown User";
    const initials =
        request.userFirstName && request.userLastName
            ? `${request.userFirstName.charAt(0)}${request.userLastName.charAt(0)}`
            : "?";

    return (
        <View className="bg-fdm-fg/5 border border-fdm-fg/10 rounded-3xl p-5 mb-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-12 h-12 rounded-full bg-fdm-accent/15 border border-fdm-accent/20 items-center justify-center">
                        <Text className="text-fdm-accent font-bold text-lg">{initials}</Text>
                    </View>
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

// City Change Card

function CityChangeCard({ request, isProcessing, onApprove, onReject }: RequestCardProps) {
    const displayName =
        request.userFirstName && request.userLastName
            ? `${request.userFirstName} ${request.userLastName}`
            : null;

    return (
        <View className="bg-fdm-fg/5 border border-fdm-fg/10 rounded-3xl p-5 mb-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                    <Ionicons name="swap-horizontal-outline" size={13} color="#ffffff50" />
                    <Text className="text-fdm-fg/40 text-xs font-semibold uppercase tracking-wider">
                        City Change
                    </Text>
                </View>
                <StatusBadge status={request.status} />
            </View>

            {/* User info */}
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

            {/* City mapping */}
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

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export default function RequestCard(props: RequestCardProps) {
    if (props.request.requestType === "CITY_CHANGE") {
        return <CityChangeCard {...props} />;
    }
    return <SignUpCard {...props} />;
}
