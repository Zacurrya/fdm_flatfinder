import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-fdm-bg items-center justify-center p-6">
      <StatusBar style="light" />
      {/* Background decorations */}
      <View className="absolute top-0 right-0 w-64 h-64 bg-fdm-accent/10 rounded-full dark:bg-fdm-accent/20 blur-3xl opacity-50" />
      <View className="absolute bottom-10 left-0 w-72 h-72 bg-fdm-accent/5 rounded-full dark:bg-fdm-accent/10 blur-3xl opacity-50" />

      <View className="items-center w-full max-w-sm z-10 mt-12">
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
            onPress={() => router.push("/(auth)/login")}
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
