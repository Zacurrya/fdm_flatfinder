import { Michroma_400Regular, useFonts } from "@expo-google-fonts/michroma";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import "../global.css";
import { AuthProvider, useAuth } from "../context/AuthContext";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const rawSegments = segments as string[];
    const inAuthGroup = rawSegments[0] === "(auth)";
    const inTabsGroup = rawSegments[0] === "(tabs)";
    const isAuthenticated = session && user;

    if (isAuthenticated && !inTabsGroup) {
      // Signed in but not on tabs → go to home
      router.replace("/(tabs)/home");
    } else if (!isAuthenticated && inTabsGroup) {
      // Not signed in but on tabs → go to landing
      router.replace("/");
    }
  }, [session, user, isLoading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Michroma_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
