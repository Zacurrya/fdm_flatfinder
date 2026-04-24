import FDMLoader from "@components/ui/FDMLoader";
import { AuthProvider } from "@context/AuthContext";
import { Michroma_400Regular, useFonts } from '@expo-google-fonts/michroma';
import { useAuth } from "@hooks/useAuth";
import { logger } from "@utils/logger";
import * as ScreenOrientation from 'expo-screen-orientation';
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const RootNavigator = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
};

// Redirects the user to auth or main app based on their auth status
const AppShell = () => {
  const { session, user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    Michroma_400Regular,
  });

  const isAuthenticated = Boolean(session && user);
  const isLoading = isAuthLoading || !fontsLoaded;

  useEffect(() => {
    if (isLoading) return;
    const inTabsGroup = segments[0] === "(tabs)";

    if (isAuthenticated) {
      // If logged in, redirect away from auth/landing screens
      if (!inTabsGroup) {
        router.replace("/(tabs)/home");
        logger.log("User authenticated, redirecting to home");
      }
    } else {
      // If logged out, redirect away from protected screens
      if (inTabsGroup) {
        router.replace("/");
        logger.log("User not authenticated, redirecting to landing page");
      }
    }

    // Hide splash screen after first routing decision
    SplashScreen.hideAsync();

  }, [isLoading, isAuthenticated, segments]);


  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#1b1b1b" }}>
        <FDMLoader />
      </View>
    );
  }

  return <RootNavigator />;
};

const RootLayout = () => {
  useEffect(() => {
    // Lock orientation to portrait by default for the entire app
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
