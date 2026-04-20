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
  const isListingDetail = rawSegments[0] === "listing";
  
  // Redirect to Home if they are authenticated and on the landing page or an auth screen)
  const isAtLandingOrAuth = 
    rawSegments.length === 0 || 
    rawSegments[0] === "" || 
    rawSegments[0] === "index" ||
    rawSegments[0] === "(auth)";

  const isAuthenticated = Boolean(session && user);

  // Redirect to Home if authenticated and sitting on Landing/Auth screens
  const shouldRedirectToHome = !isLoading && isAuthenticated && isAtLandingOrAuth;

  // Redirect to Landing if trying to access TABS or LISTINGS while not logged in
  const shouldRedirectToLanding = !isLoading && !isAuthenticated && (inTabsGroup || isListingDetail);
  
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
