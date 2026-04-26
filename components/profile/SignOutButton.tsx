import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@hooks/general/useAuth";
import { Alert, StyleProp, Text, TouchableOpacity, ViewStyle } from "react-native";

type SignOutButtonProps = {
    style?: StyleProp<ViewStyle>;
    text?: string;
    iconSize?: number;
}

const SignOutButton = ({ style, text, iconSize = 18 }: SignOutButtonProps) => {
    const { logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Sign Out", style: "destructive", onPress: logout },
            ]
        );
    };

    return (
        <TouchableOpacity
            className="py-4 rounded-2xl items-center flex-row justify-center gap-2 active:opacity-80"
            style={style}
            onPress={handleLogout}
        >
            <Ionicons name="log-out-outline" size={iconSize} color="#ef4444" />
            <Text className="text-red-400 font-bold tracking-wide">{text ? text : `Sign Out`}</Text>
        </TouchableOpacity>
    );
};

export default SignOutButton;
