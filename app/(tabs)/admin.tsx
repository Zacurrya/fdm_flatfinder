import AwaitingApprovalView from "@/components/ui/AwaitingApprovalView";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { User } from "../../services/auth/auth.types";
import * as AuthController from "../../services/auth/authController";

type PendingUser = Omit<User, "email">;

export default function AdminScreen() {
    const { user } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
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

    const handleApprove = (pendingUser: PendingUser) => {
        Alert.alert(
            "Approve User",
            `Are you sure you want to approve ${pendingUser.firstName} ${pendingUser.lastName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Approve",
                    onPress: async () => {
                        setProcessingId(pendingUser.userId);
                        const result = await AuthController.approveUser({
                            userId: pendingUser.userId,
                        });
                        setProcessingId(null);

                        if (result.success) {
                            setPendingUsers((prev) =>
                                prev.filter((u) => u.userId !== pendingUser.userId)
                            );
                        } else {
                            Alert.alert("Error", result.error ?? "Failed to approve user.");
                        }
                    },
                },
            ]
        );
    };

    const handleReject = (pendingUser: PendingUser) => {
        Alert.alert(
            "Reject User",
            `Are you sure you want to reject ${pendingUser.firstName} ${pendingUser.lastName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: async () => {
                        setProcessingId(pendingUser.userId);
                        const result = await AuthController.rejectUser({
                            userId: pendingUser.userId,
                        });
                        setProcessingId(null);

                        if (result.success) {
                            setPendingUsers((prev) =>
                                prev.filter((u) => u.userId !== pendingUser.userId)
                            );
                        } else {
                            Alert.alert("Error", result.error ?? "Failed to reject user.");
                        }
                    },
                },
            ]
        );
    };

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

    const renderUserCard = ({ item }: { item: PendingUser }) => {
        const isProcessing = processingId === item.userId;

        return (
            <View className="bg-fdm-fg/5 border border-fdm-fg/10 rounded-3xl p-5 mb-4">
                {/* Name & Badge */}
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-3 flex-1">
                        <View className="w-12 h-12 rounded-full bg-fdm-accent/15 border border-fdm-accent/20 items-center justify-center">
                            <Text className="text-fdm-accent font-bold text-lg">
                                {item.firstName.charAt(0)}{item.lastName.charAt(0)}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-fdm-fg font-bold text-base">
                                {item.firstName} {item.lastName}
                            </Text>
                            <Text className="text-fdm-fg/40 text-xs mt-0.5">
                                Registered {new Date(item.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    <View className="bg-yellow-500/15 border border-yellow-500/25 px-3 py-1 rounded-xl">
                        <Text className="text-yellow-400 text-xs font-semibold uppercase">Pending</Text>
                    </View>
                </View>

                {/* Details */}
                <View className="gap-2.5 mb-5 pl-1">
                    <View className="flex-row items-center gap-2.5">
                        <Ionicons name="call-outline" size={15} color="#ffffff60" />
                        <Text className="text-fdm-fg/70 text-sm">{item.phoneNumber || "Not provided"}</Text>
                    </View>
                    <View className="flex-row items-center gap-2.5">
                        <Ionicons name="location-outline" size={15} color="#ffffff60" />
                        <Text className="text-fdm-fg/70 text-sm">{item.officeLocation || "Not set"}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        className="flex-1 bg-fdm-accent py-3 rounded-2xl items-center active:opacity-80"
                        onPress={() => handleApprove(item)}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#1b1b1b" size="small" />
                        ) : (
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="checkmark-circle-outline" size={18} color="#1b1b1b" />
                                <Text className="text-fdm-bg font-bold text-sm">Approve</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-red-500/15 border border-red-500/25 py-3 rounded-2xl items-center active:opacity-80"
                        onPress={() => handleReject(item)}
                        disabled={isProcessing}
                    >
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
                            <Text className="text-red-400 font-bold text-sm">Reject</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
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
