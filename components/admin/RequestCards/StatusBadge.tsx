import { RequestStatus } from "@/types/enums";
import { Text, View } from "react-native";

/**
 * Renders the status of a request.
 */
export const StatusBadge = ({ status }: { status: RequestStatus }) => {
    const config =
        status === RequestStatus.PENDING
            ? { bg: "bg-yellow-500/15", border: "border-yellow-500/25", text: "text-yellow-400", label: "Pending" }
            : status === RequestStatus.APPROVED
                ? { bg: "bg-emerald-500/15", border: "border-emerald-500/25", text: "text-emerald-400", label: "Approved" }
                : { bg: "bg-red-500/15", border: "border-red-500/25", text: "text-red-400", label: "Rejected" };

    return (
        <View className={`${config.bg} border ${config.border} px-3 py-1 rounded-xl`}>
            <Text className={`${config.text} text-xs font-semibold uppercase`}>{config.label}</Text>
        </View>
    );
}
