import React from "react";
import EmailInput from "@components/auth/EmailInput";
import PasswordInput from "@/components/auth/PasswordInput";
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type LoginFormProps = {
  email: string;
  password: string;
  emailError?: string;
  passwordError?: string;
  errorMessage?: string;
  isSubmitting?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onPressRegister: () => void;
};

export default function LoginForm({
  email,
  password,
  emailError,
  passwordError,
  errorMessage,
  isSubmitting = false,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onPressRegister,
}: LoginFormProps) {
  return (
    <View className="flex-1 w-full max-w-sm self-center justify-center z-10 mb-12">
      <View className="items-center mt-3 mb-10 w-full">
        <Text
          className="text-fdm-fg text-3xl mb-3 tracking-tighter text-center"
          style={{ fontFamily: "Michroma_400Regular" }}
        >
          Welcome <Text className="text-fdm-accent">Back</Text>
        </Text>
        <Text className="text-fdm-fg/50 text-sm text-center">
          Sign in to continue finding your next flat.
        </Text>
      </View>

      <View className="w-full gap-4">
        <EmailInput
          value={email}
          onChangeText={onEmailChange}
          error={emailError}
          editable={!isSubmitting}
        />

        <PasswordInput
          label="Password"
          value={password}
          onChangeText={onPasswordChange}
          placeholder="Minimum 8 characters"
          error={passwordError}
          autoComplete="password"
          textContentType="password"
          editable={!isSubmitting}
        />
      </View>

      {errorMessage ? <Text className="text-red-400 text-sm mt-4">{errorMessage}</Text> : null}

      <TouchableOpacity
        className="w-2/3 self-center bg-fdm-accent py-4 rounded-2xl items-center shadow-lg shadow-fdm-accent/20 active:opacity-80 transition-opacity mt-8"
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#1b1b1b" />
        ) : (
          <Text className="text-fdm-bg font-bold tracking-wide uppercase">Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="self-center mt-6"
        onPress={onPressRegister}
        disabled={isSubmitting}
      >
        <Text className="text-fdm-fg/70">
          New here? <Text className="text-fdm-accent font-semibold">Create an account</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
