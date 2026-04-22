import { AuthProvider } from "@context/AuthContext";
import { useAuth } from "@hooks/useAuth";
import { logger } from "@utils/logger";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

// Redirects the user to auth or main app based on their auth status
function AppShell() {
  const { session, user, isLoading } = useAuth();
  const router = useRouter();

  const isAuthenticated = Boolean(session && user);

  useEffect(() => {
    if (isLoading) { return; }
    else if (!isLoading) {
      // If the user is authenticated -> home
      if (isAuthenticated) {
        router.replace("/(tabs)/home");
        logger.log("Active session found, navigating to home screen");
        return;
      }
      // If the user isn't authenticated
      if (!isAuthenticated) {
        router.replace("/");
        logger.log("No active session found, navigating to landing page");
      }
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return <RootNavigator />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
