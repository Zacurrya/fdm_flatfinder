import LoginForm from "@components/auth/LoginForm";
import BackButton from "@components/ui/BackButton";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import { useLoginForm } from "@hooks/useLoginForm";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, KeyboardAvoidingView, Platform, View, useWindowDimensions } from "react-native";

export default function Login() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const {
    email,
    password,
    emailError,
    passwordError,
    errorMessage,
    isBusy,
    isResettingPassword,
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
    handleResetPassword,
  } = useLoginForm();

  const onResetPassword = async () => {
    await handleResetPassword();
    // Only show the success alert if no error was set (hook handles error state internally)
    if (!errorMessage && !isResettingPassword) {
      Alert.alert("Reset Email Sent", "Check your inbox for password reset instructions.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-fdm-bg p-6"
    >
      <StatusBar style="light" hidden={width > height} />

      <BackgroundCircle top={-100} left={-100} size={288} color="#CCFF001A" opacity={0.5} />
      <BackgroundCircle bottom={-100} right={-100} size={384} color="#CCFF000D" opacity={0.4} />

      <View
        className={`${width > height ? "pt-4" : "pt-10"} pb-2 w-full max-w-sm self-center flex-row items-center z-10`}
      >
        <BackButton />
      </View>

      <LoginForm
        email={email}
        password={password}
        emailError={emailError}
        passwordError={passwordError}
        errorMessage={errorMessage}
        isSubmitting={isBusy}
        onEmailChange={handleEmailChange}
        onPasswordChange={handlePasswordChange}
        onSubmit={handleLogin}
        onPressResetPassword={onResetPassword}
        onPressRegister={() => router.push("/(auth)/register")}
      />
    </KeyboardAvoidingView>
  );
}
