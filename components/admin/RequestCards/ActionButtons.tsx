import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { RequestCardProps } from "./types";

const ActionButtons = ({
    request,
    isProcessing,
    onApprove,
    onReject,
}: Pick<RequestCardProps, "request" | "isProcessing" | "onApprove" | "onReject">) => {
    return (
        <View className="flex-row gap-2 mt-auto">

            {/* Reject button */}
            <TouchableOpacity
                className="flex-1 bg-fdm-fg/10 h-10 rounded-xl items-center justify-center border border-fdm-fg/10"
                onPress={() => onReject(request)}
                disabled={isProcessing}
            >
                <Text className="text-fdm-fg/60 font-bold text-xs uppercase tracking-widest">Reject</Text>
            </TouchableOpacity>

            {/* Approve button */}
            <TouchableOpacity
                className="flex-1 bg-fdm-accent h-10 rounded-xl items-center justify-center"
                onPress={() => onApprove(request)}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <ActivityIndicator color="#1b1b1b" size="small" />
                ) : (
                    <Text className="text-fdm-bg font-bold text-xs uppercase tracking-widest">Approve</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default ActionButtons;
