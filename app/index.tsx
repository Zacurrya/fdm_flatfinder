import AuthButton from "@components/auth/AuthButton";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import { useAuth } from "@hooks/useAuth";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View, useWindowDimensions } from "react-native";

const Index = () => {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const { width, height } = useWindowDimensions();


  // Prevent UI flickering while checking session
  if (isLoading) return null;

  // If there is a session, don't render the landing page 
  if (session) return null;

  return (
    <View className="flex-1 bg-fdm-bg items-center justify-center p-6">
      <StatusBar style="light" hidden={width > height} />
      {/* Background decorations */}
      <BackgroundCircle y={0} x="80%" size={256} color="#CCFF001A" darkColor="#CCFF0033" opacity={0.5} />
      <BackgroundCircle y="90%" x={0} size={288} color="#CCFF000D" darkColor="#CCFF001A" opacity={0.5} />
      <BackgroundCircle y={60} x={-25} size={120} color="#CCFF001A" darkColor="#CAFF033" opacity={0.4} />

      {/* Logo and title */}
      <Image
        source={require("@assets/images/logo.svg")}
        style={{ width: 320, height: 50 }}
        contentFit="contain"
        tintColor="#ccff00"
      />
      <View className="mt-2 items-center mb-12">
        <Text className="text-fdm-accent text-3xl" style={{ fontFamily: 'Michroma_400Regular' }}>Relocate</Text>
      </View>


      {/* Login sign up buttons */}
      <View className="gap-4 w-full flex-col items-center">
        <AuthButton
          label="Log In"
          onPress={() => router.push("/(auth)/login")}
          backgroundColour="#ccff00"
          textColour="#1b1b1b"
        />

        <AuthButton
          label="Sign Up"
          onPress={() => router.push("/(auth)/register")}
          backgroundColour="transparent"
          borderColour="#ccff00"
          textColour="#ccff00"
        />
      </View>
    </View>
  );
};

export default Index;
