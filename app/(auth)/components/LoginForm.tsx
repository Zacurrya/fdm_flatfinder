import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FormTextInput from "./TextInput";

type LoginFormProps = {
  email: string;
  password: string;
  emailError: string;
  passwordError: string;
  errorMessage: string;
  isSubmitting: boolean;
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
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onPressRegister,
}: LoginFormProps) {
  return (
    <View className="flex-1 w-full max-w-sm self-center justify-center z-10 mb-12">
      {/* Titles */}
      <View className="items-center mt-3 mb-12 w-full">
        <Text
          className="text-fdm-fg text-3xl mb-3 tracking-tighter text-center"
          style={{ fontFamily: "Michroma_400Regular" }}
        >
          Welcome <Text className="text-fdm-accent">Back</Text>
        </Text>
      </View>

      {/* Form Fields */}
      <View className="w-full gap-5">
        <View>
          <FormTextInput
            label="Email"
            icon="mail-outline"
            placeholder="you@fdmgroup.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={onEmailChange}
          />
          {emailError ? <Text className="text-red-400 text-sm mt-1">{emailError}</Text> : null}
        </View>

        <View>
          <FormTextInput
            label="Password"
            icon="lock-closed-outline"
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={onPasswordChange}
          />
          {passwordError ? (
            <Text className="text-red-400 text-sm mt-1">{passwordError}</Text>
          ) : null}
        </View>

        <TouchableOpacity className="self-end mt-2">
          <Text className="text-fdm-accent font-semibold tracking-wide">Forgot Password?</Text>
        </TouchableOpacity>

        {errorMessage ? <Text className="text-red-400 text-sm mt-1">{errorMessage}</Text> : null}
      </View>

      {/* Submit */}
      <TouchableOpacity
        className="w-full bg-fdm-accent py-4 rounded-2xl items-center shadow-lg shadow-fdm-accent/20 active:opacity-80 transition-opacity mt-8"
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        <Text className="text-fdm-bg font-bold text-lg tracking-wide uppercase">
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Text>
      </TouchableOpacity>

      {/* Switch to register */}
      <View className="flex-row justify-center items-center mt-6 gap-1">
        <Text className="text-fdm-fg/50 text-sm">Don&apos;t have an account?</Text>
        <TouchableOpacity onPress={onPressRegister}>
          <Text className="text-fdm-accent font-semibold text-sm"> Create one</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
