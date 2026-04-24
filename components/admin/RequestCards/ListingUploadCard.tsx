import { PropertyType, RentPeriod, RequestStatus } from "@/types/enums";
import { formatPropertyType, formatRentPeriod } from "@/utils/formatters";
import { Text, View } from "react-native";
import ActionButtons from "./ActionButtons";
import { RequestCardProps } from "./types";

const ListingUploadCard = ({ request, isProcessing, onApprove, onReject }: RequestCardProps) => {
    const isPending = request.status === RequestStatus.PENDING;

    return (
        <View className="bg-fdm-fg/5 rounded-2xl p-4 mb-4 border border-fdm-fg/10">
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                    <Text className="text-fdm-fg/50 text-xs uppercase tracking-widest mb-1">
                        Listing Upload Request
                    </Text>
                    <Text className="text-fdm-fg font-bold text-lg leading-tight" numberOfLines={2}>
                        {request.listingTitle || "New Property Listing"}
                    </Text>

                    <View className="flex-row items-center gap-3 mt-2">
                        <Text className="text-fdm-accent font-bold text-sm">
                            {typeof request.listingPrice === "number"
                                ? `£${request.listingPrice}/${formatRentPeriod(request.listingRentPeriod ?? RentPeriod.MONTHLY)}`
                                : "Price unavailable"}
                        </Text>
                        <Text className="text-fdm-fg/40 text-xs">
                            {formatPropertyType(request.listingPropertyType ?? PropertyType.FLAT)}
                        </Text>
                    </View>
                </View>

                <View className="ml-4">
                    <View className={`px-2 py-1 rounded-md ${request.status === RequestStatus.APPROVED ? 'bg-green-500/20' :
                            request.status === RequestStatus.REJECTED ? 'bg-red-500/20' :
                                'bg-yellow-500/20'
                        }`}>
                        <Text className={`text-[10px] font-bold ${request.status === RequestStatus.APPROVED ? 'text-green-500' :
                                request.status === RequestStatus.REJECTED ? 'text-red-500' :
                                    'text-yellow-500'
                            }`}>
                            {request.status}
                        </Text>
                    </View>
                </View>
            </View>

            <View className="bg-fdm-fg/5 rounded-xl p-3 mb-4">
                <View className="flex-row justify-between mb-2">
                    <Text className="text-fdm-fg/40 text-xs">Submitted by</Text>
                    <Text className="text-fdm-fg text-xs font-medium">{request.userEmail}</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-fdm-fg/40 text-xs">Location</Text>
                    <Text className="text-fdm-fg text-xs font-medium">{request.listingCity || "N/A"}</Text>
                </View>
            </View>

            {isPending && (
                <ActionButtons
                    request={request}
                    isProcessing={isProcessing}
                    onApprove={onApprove}
                    onReject={onReject}
                />
            )}
        </View>
    );
};

export default ListingUploadCard;
