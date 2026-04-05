import ApprovalRequestCard from "@/components/admin/ApprovalRequestCard";
import AwaitingApprovalView from "@/components/ui/AwaitingApprovalView";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Text,
    View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { User } from "../../services/auth/auth.types";
import * as AuthController from "../../services/auth/authController";

export default function AdminScreen() {
    const { user } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchPendingUsers = useCallback(async () => {
        const result = await AuthController.getPendingUsers();
        if (result.success && result.data) {
            setPendingUsers(result.data);
        }
    }, []);

    useEffect(() => {
        fetchPendingUsers().finally(() => setIsLoading(false));
    }, [fetchPendingUsers]);

    const handleDecision = (pendingUser: User, action: "approve" | "reject") => {
        const isApprove = action === "approve";
        const actionLabel = isApprove ? "Approve" : "Reject";

        Alert.alert(
            `${actionLabel} User`,
            `Are you sure you want to ${action} ${pendingUser.firstName} ${pendingUser.lastName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: actionLabel,
                    style: isApprove ? "default" : "destructive",
                    onPress: async () => {
                        setProcessingId(pendingUser.userId);
                        const result = isApprove
                            ? await AuthController.approveUser({ userId: pendingUser.userId })
                            : await AuthController.rejectUser({ userId: pendingUser.userId });
                        setProcessingId(null);

                        if (result.success) {
                            setPendingUsers((prev) =>
                                prev.filter((u) => u.userId !== pendingUser.userId)
                            );
                        } else {
                            Alert.alert("Error", result.error ?? `Failed to ${action} user.`);
                        }
                    },
                },
            ]
        );
    };

    const handleApprove = (pendingUser: User) => handleDecision(pendingUser, "approve");

    const handleReject = (pendingUser: User) => handleDecision(pendingUser, "reject");

    if (user?.approvalStatus === "PENDING" || user?.approvalStatus === "REJECTED") {
        return (
            <AwaitingApprovalView
                title={user.approvalStatus === "REJECTED" ? "Account Denied" : "Awaiting Admin Approval"}
                message={
                    user.approvalStatus === "REJECTED"
                        ? "Your account has been denied. Please contact an administrator for more information."
                        : "Your account is awaiting admin approval."
                }
            />
        );
    }

    // Guard: only ADMINs should see this
    if (user?.role !== "ADMIN") {
        return (
            <View className="flex-1 bg-fdm-bg items-center justify-center p-6">
                <StatusBar style="light" />
                <Ionicons name="lock-closed-outline" size={48} color="#ffffff30" />
                <Text className="text-fdm-fg/50 text-base mt-4 text-center">
                    You don&apos;t have permission to access this page.
                </Text>
            </View>
        );
    }

    const renderUserCard = ({ item }: { item: User }) => {
        const isProcessing = processingId === item.userId;

        return (
            <ApprovalRequestCard
                user={item}
                isProcessing={isProcessing}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        );
    };

    return (
        <View className="flex-1 bg-fdm-bg">
            <StatusBar style="light" />

            {/* Decorative blob */}
            <View className="absolute top-0 right-0 w-64 h-64 bg-fdm-accent/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

            {/* Header */}
            <View className="pt-16 pb-4 px-6 z-10">
                <Text
                    className="text-fdm-fg text-2xl tracking-tighter"
                    style={{ fontFamily: "Michroma_400Regular" }}
                >
                    Admin <Text className="text-fdm-accent">Panel</Text>
                </Text>
                <Text className="text-fdm-fg/50 text-sm mt-1">
                    {pendingUsers.length} pending {pendingUsers.length === 1 ? "request" : "requests"}
                </Text>
            </View>

            {/* Content */}
            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#ccff00" size="large" />
                </View>
            ) : pendingUsers.length === 0 ? (
                <FlatList
                    data={[]}
                    renderItem={null}
                    keyExtractor={(_, index) => String(index)}
                    contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="items-center justify-center px-6">
                            <Ionicons name="checkmark-done-circle-outline" size={64} color="#ccff0040" />
                            <Text className="text-fdm-fg/50 text-base mt-4 text-center">
                                No pending approval requests.
                            </Text>
                            <Text className="text-fdm-fg/30 text-sm mt-1 text-center">
                                New requests will appear here.
                            </Text>
                        </View>
                    }
                />
            ) : (
                <FlatList
                    data={pendingUsers}
                    renderItem={renderUserCard}
                    keyExtractor={(item) => item.userId}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}
