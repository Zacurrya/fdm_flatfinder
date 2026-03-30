import BackButton from '@/components/ui/BackButton';
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@components/auth/LoginForm";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInputs = (trimmedEmail: string, currentPassword: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;

    if (!trimmedEmail) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!emailPattern.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!currentPassword) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (currentPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError("");
    }
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      setPasswordError("");
    }
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!validateInputs(trimmedEmail, password)) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await login({ email: trimmedEmail, password });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error ?? "Unable to sign in. Please try again.");
      return;
    }

    // Navigation is handled by RootNavigator in _layout.tsx
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-fdm-bg p-6"
    >
      <StatusBar style="light" />

      {/* Decorative Background Elements */}
      <View className="absolute top-[-100px] left-[-100px] w-72 h-72 bg-fdm-accent/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <View className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-fdm-accent/5 rounded-full blur-3xl opacity-40 pointer-events-none" />

      {/* Header */}
      <View className="pt-10 pb-2 w-full max-w-sm self-center flex-row items-center z-10">
        <BackButton />
      </View>

      <LoginForm
        email={email}
        password={password}
        emailError={emailError}
        passwordError={passwordError}
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        onEmailChange={handleEmailChange}
        onPasswordChange={handlePasswordChange}
        onSubmit={handleLogin}
        onPressRegister={() => router.push("/(auth)/register")}
      />
    </KeyboardAvoidingView>
  );
}
