import { AuthProvider, useAuth } from "@context/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
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
  const segments = useSegments();
  const router = useRouter();

  const rawSegments = segments as string[];
  const inTabsGroup = rawSegments[0] === "(tabs)";
  const isAuthenticated = Boolean(session && user);
  const shouldRedirectToHome = !isLoading && isAuthenticated && !inTabsGroup;
  const shouldRedirectToLanding = !isLoading && !isAuthenticated && inTabsGroup;
  const isRouteReady = !shouldRedirectToHome && !shouldRedirectToLanding;

  useEffect(() => {
    if (isLoading) return;

    if (shouldRedirectToHome) {
      router.replace("/(tabs)/home");
      return;
    }

    if (shouldRedirectToLanding) {
      router.replace("/");
    }
  }, [isLoading, shouldRedirectToHome, shouldRedirectToLanding, router]);

  useEffect(() => {
    if (!isLoading && isRouteReady) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, isRouteReady]);

  if (isLoading || !isRouteReady) {
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
