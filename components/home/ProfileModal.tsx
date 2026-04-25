import { RegionCities } from "@/types/locations";
import OfficeLocationSelector from "@components/ui/OfficeLocationSelector";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@hooks/useAuth";
import { useUserSettings } from "@hooks/useUserSettings";
import { LocationService } from "@services/locations/locationService";
import { getInitials } from "@utils/formatters";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ProfileModalProps = {
    visible: boolean;
    onClose: () => void;
};

const ProfileModal = ({ visible, onClose }: ProfileModalProps) => {
    const { user, logout } = useAuth();
    const {
        selectedCity,
        selectedRegion,
        handleSelectCity,
        isSubmittingCityChange,
        cityError,
        cityMessage,
        handleRequestCityChange,
    } = useUserSettings(visible);

    const [citiesByRegion, setCitiesByRegion] = useState<RegionCities[]>([]);
    const [isChangingCity, setIsChangingCity] = useState(false);

    useEffect(() => {
        if (visible) {
            LocationService.getCitiesByRegion().then(setCitiesByRegion);
        } else {
            setIsChangingCity(false);
        }
    }, [visible]);

    if (!user) return null;

    const initials = getInitials(user.firstName, user.lastName);

    const handleLogout = async () => {
        await logout();
    };

    const handleCityChangeSubmit = async () => {
        await handleRequestCityChange();
        // After a short delay, maybe close or go back to profile view
        setTimeout(() => {
            setIsChangingCity(false);
        }, 2000);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.overlay}
                onPress={onClose}
            >
                <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={28} color="#ffffff55" />
                    </TouchableOpacity>

                    <View className="items-center mb-8">
                        {user.avatarUrl ? (
                            <Image
                                source={{ uri: user.avatarUrl }}
                                style={styles.avatar}
                                contentFit="cover"
                            />
                        ) : (
                            <View style={styles.initialsContainer}>
                                <Text style={styles.initialsText}>{initials}</Text>
                            </View>
                        )}
                        <Text
                            className="text-white text-2xl mt-4"
                            style={{ fontFamily: "Michroma_400Regular" }}
                        >
                            {user.firstName} {user.lastName}
                        </Text>
                        <Text className="text-gray-400 text-sm">{user.email}</Text>
                    </View>

                    {!isChangingCity ? (
                        <View className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/5">
                            <View className="flex-row items-center justify-between mb-8">
                                <View className="flex-row items-center">
                                    <View className="w-12 h-12 rounded-2xl bg-fdm-accent/10 items-center justify-center">
                                        <Ionicons name="location" size={24} color="#ccff00" />
                                    </View>
                                    <View className="ml-4">
                                        <Text className="text-gray-500 text-[10px] uppercase tracking-[2px] font-bold">Office Location</Text>
                                        <Text className="text-white text-lg font-semibold">{user.officeLocation}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setIsChangingCity(true)}
                                    className="bg-fdm-accent/10 px-4 py-2 rounded-xl border border-fdm-accent/20"
                                >
                                    <Text className="text-fdm-accent font-bold text-xs uppercase">Transfer</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center">
                                <View className="w-12 h-12 rounded-2xl bg-fdm-accent/10 items-center justify-center">
                                    <Ionicons name="call" size={24} color="#ccff00" />
                                </View>
                                <View className="ml-4">
                                    <Text className="text-gray-500 text-[10px] uppercase tracking-[2px] font-bold">Phone Number</Text>
                                    <Text className="text-white text-lg font-semibold">{user.phoneNumber || "Not provided"}</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/5">
                            <Text className="text-white text-lg font-bold mb-4">Request City Transfer</Text>
                            <OfficeLocationSelector
                                label="New Office Location"
                                citiesByRegion={citiesByRegion}
                                selectedCity={selectedCity}
                                selectedRegion={selectedRegion}
                                onSelectCity={handleSelectCity}
                                errorMessage={cityError || undefined}
                            />

                            {cityMessage ? (
                                <View className="bg-green-500/10 p-3 rounded-xl mt-4 border border-green-500/20">
                                    <Text className="text-green-400 text-sm text-center font-medium">{cityMessage}</Text>
                                </View>
                            ) : null}

                            <View className="flex-row gap-3 mt-8">
                                <TouchableOpacity
                                    onPress={() => setIsChangingCity(false)}
                                    className="flex-1 bg-white/5 p-4 rounded-2xl items-center border border-white/10"
                                >
                                    <Text className="text-white font-bold">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleCityChangeSubmit}
                                    disabled={!selectedCity || isSubmittingCityChange}
                                    className={`flex-1 p-4 rounded-2xl items-center ${!selectedCity || isSubmittingCityChange ? 'opacity-50 bg-fdm-accent' : 'bg-fdm-accent'}`}
                                >
                                    {isSubmittingCityChange ? (
                                        <ActivityIndicator color="#000" />
                                    ) : (
                                        <Text className="text-black font-bold">Request</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handleLogout}
                        style={styles.logoutButton}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                        <Text className="text-red-500 font-bold ml-2 text-lg">Logout</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.8)",
    },
    modalContent: {
        width: "100%",
        backgroundColor: "#1b1b1b",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 32,
        paddingTop: 48,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: "#ccff0022",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
    },
    closeButton: {
        position: "absolute",
        right: 24,
        top: 24,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 4
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: "#ccff00",
    },
    initialsContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#ccff00",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#ccff00",
    },
    initialsText: {
        fontSize: 48,
        color: "#000",
        fontFamily: "Michroma_400Regular",
    },
    logoutButton: {
        backgroundColor: "rgba(239, 68, 68, 0.08)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.15)",
        marginBottom: 16
    },
});

export default ProfileModal;
