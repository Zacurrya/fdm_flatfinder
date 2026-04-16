import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Text, TouchableOpacity } from "react-native";

const SignOutButton = () => {
    const { logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    return (
        <TouchableOpacity
            className="w-[40%] bg-red-500/10 border border-red-500/20 py-4 rounded-2xl items-center flex-row justify-center gap-2 active:opacity-80"
            onPress={handleLogout}
        >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="text-red-400 font-bold tracking-wide">Sign Out</Text>
        </TouchableOpacity>
    );
};

export default SignOutButton;