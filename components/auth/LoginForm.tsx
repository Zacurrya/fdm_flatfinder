import React from "react";
import {
    ActivityIndicator,
    Text,
    TextInput,
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
        <View>
          <Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">
            Email
          </Text>
          <TextInput
            className="h-14 bg-fdm-fg/5 border-[1.5px] border-fdm-fg/10 rounded-2xl px-4 text-fdm-fg"
            value={email}
            onChangeText={onEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="you@company.com"
            placeholderTextColor="#ffffff66"
            editable={!isSubmitting}
          />
          {emailError ? <Text className="text-red-400 text-sm mt-1">{emailError}</Text> : null}
        </View>

        <View>
          <Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">
            Password
          </Text>
          <TextInput
            className="h-14 bg-fdm-fg/5 border-[1.5px] border-fdm-fg/10 rounded-2xl px-4 text-fdm-fg"
            value={password}
            onChangeText={onPasswordChange}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            placeholder="Minimum 8 characters"
            placeholderTextColor="#ffffff66"
            editable={!isSubmitting}
          />
          {passwordError ? (
            <Text className="text-red-400 text-sm mt-1">{passwordError}</Text>
          ) : null}
        </View>
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
