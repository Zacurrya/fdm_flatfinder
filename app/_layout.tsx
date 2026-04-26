import FDMLoader from "@components/ui/FDMLoader";
import { AuthProvider } from "@context/AuthContext";
import { SavedListingsProvider } from "@context/SavedListingsContext";
import { Michroma_400Regular, useFonts } from '@expo-google-fonts/michroma';
import { useAuth } from "@hooks/general/useAuth";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

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
  const { session, user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    Michroma_400Regular,
  });

  const isAuthenticated = session && user;
  const isLoading = !fontsLoaded;

  useEffect(() => {
    if (isLoading) return;
    const inTabsGroup = segments[0] === "(tabs)";
    const isListingPage = segments[0] === "listing" && segments.length === 2;

    if (isAuthenticated) {
      // If logged in, redirect away from auth/landing screens
      if (!inTabsGroup && !isListingPage) {
        router.replace("/home");
        console.log("User authenticated, redirecting to home");
      }
    } else {
      // If logged out, redirect away from protected screens
      if (inTabsGroup || isListingPage) {
        router.replace("/");
        console.log("User not authenticated, redirecting to landing page");
      }
    }

    // Hide splash screen after first routing decision
    SplashScreen.hideAsync();

  }, [isLoading, isAuthenticated, segments, router]);


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
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SavedListingsProvider>
            <AppShell />
          </SavedListingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
