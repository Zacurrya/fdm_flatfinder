import { useAuth } from "@/hooks/useAuth"; // Assuming your hook location
import BackgroundCircle from "@components/ui/BackgroundCircle";
import { logger } from "@utils/logger";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

export default function Index() {
  const { session, isLoading } = useAuth();
    const router = useRouter();
    const { width, height } = useWindowDimensions();

    useEffect(() => {
      // Only redirect once we've finished checking for an existing session
      if (!isLoading && session) {
        router.replace("/(tabs)/home"); 
        logger.log("Active session found, navigating to home screen");
      }
    }, [session, isLoading, router]);

    // Prevent UI flickering while checking session
    if (isLoading) return null; 

    // If there is a session, don't render the landing page 
    if (session) return null;

  return (
    <View className="flex-1 bg-fdm-bg items-center justify-center p-6">
      <StatusBar style="light" hidden={width > height} />
      {/* Background decorations */}
      <BackgroundCircle top={0} right={0} size={256} color="#CCFF001A" darkColor="#CCFF0033" opacity={0.5} />
      <BackgroundCircle bottom={40} left={0} size={288} color="#CCFF000D" darkColor="#CCFF001A" opacity={0.5} />

      <View className={`items-center w-full max-w-sm z-10 ${width > height ? "mt-4" : "mt-12"}`}>
        {/* FDM Logo */}
        <Image
          source={require("../assets/images/logo.svg")}
          style={{ width: 320, height: 50 }}
          contentFit="contain"
          tintColor="#ccff00"
        />

        <View className="items-center mb-12 w-full">
          {/* App name and tagline */}
          <Text className="text-fdm-fg text-3xl mt-1 mb-2 tracking-tighter text-center" style={{ fontFamily: 'Michroma_400Regular' }}>
            <Text className="text-fdm-accent">Relocate</Text>
          </Text>
          <Text className="text-fdm-fg/70 text-base text-center font-medium px-4 leading-6">
            Find your perfect home anywhere and connect with FDMers
          </Text>
        </View>

        <View className="w-full gap-5">
          <TouchableOpacity
            className="w-full bg-fdm-accent py-4 rounded-2xl items-center shadow-lg shadow-fdm-accent/20 active:opacity-80 transition-opacity"
            accessibilityLabel="Click to login"
            onPress={() => {
              router.push("/(auth)/login")
              logger.log("No active session found, navigating to login screen");
            }}
          >
            <Text className="text-fdm-bg font-bold text-lg tracking-wide uppercase">Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-transparent py-4 rounded-2xl items-center border-[1.5px] border-fdm-fg/20 active:bg-fdm-fg/5 transition-colors"
            accessibilityLabel="Click to sign up"
            onPress={() => router.push("/(auth)/register")}
          >
            <Text className="text-fdm-fg font-bold text-lg tracking-wide">Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
