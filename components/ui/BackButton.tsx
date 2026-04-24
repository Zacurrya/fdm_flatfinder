import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { TouchableOpacity } from "react-native";


const HIERARCHY: Record<string, string> = {
    "login": "/",                  // login → landing
    "register": "/",      // register → login
    "office-location": "/(auth)/register",   // office-location → register
    "[chatId]": "/(tabs)/messages",   // chat → messages
};

type BackButtonProps = {
    /** Override the default destination */
    fallback?: string;
};

const BackButton = ({ fallback }: BackButtonProps) => {
    const router = useRouter();
    const segments = useSegments();

    const handlePress = () => {
        // Get the current screen name (last segment)
        const currentScreen = segments[segments.length - 1] ?? "";

        // Check hierarchy for a defined parent
        const parent = HIERARCHY[currentScreen] ?? fallback;

        if (parent) {
            router.replace(parent as any);
        } else {
            // Last resort: try native back, or go to landing
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace("/");
            }
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            className="w-11 h-11 items-center justify-center rounded-full bg-fdm-fg/10 active:bg-fdm-fg/20 border border-fdm-fg/10"
            accessibilityLabel="Go back"
        >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>
    );
};

export default BackButton;
