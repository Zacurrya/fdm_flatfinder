import { RequestStatus } from "@/types/enums";
import { AdminRequest } from "@/types/views";
import FDMLoader from "@components/ui/FDMLoader";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import AdminTabs from "./AdminTabs";
import RequestCard from "./RequestCard";

type RequestsListProps = {
    requests: AdminRequest[];
    isLoading: boolean;
    errorMessage: string;
    statusFilter: RequestStatus | "ALL";
    processingId: number | null;
    onChangeFilter: (filter: RequestStatus | "ALL") => void;
    onApprove: (request: AdminRequest) => void;
    onReject: (request: AdminRequest) => void;
    onRefresh: () => void;
    isRefreshing: boolean;
    showInlineTabs?: boolean;
    activeTab?: "requests" | "audits";
    onChangeTab?: (tab: "requests" | "audits") => void;
};

const FILTER_OPTIONS: { label: string; value: RequestStatus | "ALL" }[] = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: RequestStatus.PENDING },
    { label: "Approved", value: RequestStatus.APPROVED },
    { label: "Rejected", value: RequestStatus.REJECTED },
];

const RequestsList = ({
    requests,
    isLoading,
    errorMessage,
    statusFilter,
    processingId,
    onChangeFilter,
    onApprove,
    onReject,
    showInlineTabs = false,
    activeTab = "requests",
    onChangeTab,
}: RequestsListProps) => {
    const renderItem = ({ item }: { item: AdminRequest }) => (
        <RequestCard
            request={item}
            isProcessing={processingId === item.id}
            onApprove={onApprove}
            onReject={onReject}
        />
    );

    return (
        <View className="flex-1">
            {/* Filter Options */}
            <View className="flex-row items-center gap-2 px-6 pb-3 flex-wrap">
                {showInlineTabs && onChangeTab ? (
                    <AdminTabs activeTab={activeTab} onChangeTab={onChangeTab} />
                ) : null}
                {FILTER_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        className={`px-3 py-1.5 rounded-xl border ${statusFilter === option.value
                            ? "bg-fdm-accent/20 border-fdm-accent"
                            : "bg-fdm-fg/5 border-fdm-fg/10"
                            }`}
                        onPress={() => onChangeFilter(option.value)}
                    >
                        <Text
                            className={`text-[11px] font-semibold uppercase ${statusFilter === option.value
                                ? "text-fdm-accent"
                                : "text-fdm-fg/60"
                                }`}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}

                <View className="flex-1" />
            </View>

            {/* Content */}
            {isLoading ? (
                <FDMLoader />
            ) : errorMessage ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-red-400 text-sm text-center">{errorMessage}</Text>
                </View>
            ) : requests.length === 0 ? (
                <FlatList
                    data={[]}
                    renderItem={null}
                    keyExtractor={(_, index) => String(index)}
                    contentContainerStyle={{
                        flexGrow: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 24,
                    }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="items-center justify-center px-6">
                            <Ionicons name="document-text-outline" size={64} color="#ccff0040" />
                            <Text className="text-fdm-fg/50 text-base mt-4 text-center">
                                No requests found.
                            </Text>
                            <Text className="text-fdm-fg/30 text-sm mt-1 text-center">
                                {statusFilter !== "ALL"
                                    ? `No ${statusFilter.toLowerCase()} requests to display.`
                                    : "New requests will appear here."}
                            </Text>
                        </View>
                    }
                />
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default RequestsList;
