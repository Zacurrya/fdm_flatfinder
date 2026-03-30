import React from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

type RegisterFormProps = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  firstNameError?: string;
  lastNameError?: string;
  emailError?: string;
  phoneNumberError?: string;
  passwordError?: string;
  confirmPasswordError?: string;
  formError?: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onPressLogin: () => void;
};

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoComplete?:
    | "name"
    | "given-name"
    | "family-name"
    | "email"
    | "tel"
    | "password"
    | "new-password";
  textContentType?:
    | "name"
    | "givenName"
    | "familyName"
    | "emailAddress"
    | "telephoneNumber"
    | "password"
    | "newPassword";
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = "default",
  autoComplete,
  textContentType,
}: FieldProps) {
  return (
    <View>
      <Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">
        {label}
      </Text>
      <TextInput
        className="h-14 bg-fdm-fg/5 border-[1.5px] border-fdm-fg/10 rounded-2xl px-4 text-fdm-fg"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#ffffff66"
        autoCapitalize="none"
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        textContentType={textContentType}
        secureTextEntry={secureTextEntry}
      />
      {error ? <Text className="text-red-400 text-sm mt-1">{error}</Text> : null}
    </View>
  );
}

export default function RegisterForm({
  firstName,
  lastName,
  email,
  phoneNumber,
  password,
  confirmPassword,
  firstNameError,
  lastNameError,
  emailError,
  phoneNumberError,
  passwordError,
  confirmPasswordError,
  formError,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneNumberChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onPressLogin,
}: RegisterFormProps) {
  return (
    <ScrollView
      className="flex-1 w-full max-w-sm self-center z-10"
      contentContainerStyle={{ paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="items-center mt-3 mb-8 w-full">
        <Text
          className="text-fdm-fg text-3xl mb-3 tracking-tighter text-center"
          style={{ fontFamily: "Michroma_400Regular" }}
        >
          Create <Text className="text-fdm-accent">Account</Text>
        </Text>
        <Text className="text-fdm-fg/50 text-sm text-center">
          Step 1 of 2: Fill in your details to get started.
        </Text>
      </View>

      <View className="w-full gap-4">
        <Field
          label="First Name"
          value={firstName}
          onChangeText={onFirstNameChange}
          placeholder="Jane"
          error={firstNameError}
          autoComplete="given-name"
          textContentType="givenName"
        />
        <Field
          label="Last Name"
          value={lastName}
          onChangeText={onLastNameChange}
          placeholder="Doe"
          error={lastNameError}
          autoComplete="family-name"
          textContentType="familyName"
        />
        <Field
          label="Email"
          value={email}
          onChangeText={onEmailChange}
          placeholder="you@company.com"
          error={emailError}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Field
          label="Phone Number"
          value={phoneNumber}
          onChangeText={onPhoneNumberChange}
          placeholder="+44 7700 900123"
          error={phoneNumberError}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={onPasswordChange}
          placeholder="Minimum 8 characters"
          error={passwordError}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <Field
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
          placeholder="Re-enter your password"
          error={confirmPasswordError}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
        />
      </View>

      {formError ? <Text className="text-red-400 text-sm mt-4">{formError}</Text> : null}

      <TouchableOpacity
        className="w-2/3 self-center bg-fdm-accent py-4 rounded-2xl items-center shadow-lg shadow-fdm-accent/20 active:opacity-80 transition-opacity mt-8"
        onPress={onSubmit}
      >
        <Text className="text-fdm-bg font-bold tracking-wide uppercase">Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity className="self-center mt-6" onPress={onPressLogin}>
        <Text className="text-fdm-fg/70">
          Already have an account? <Text className="text-fdm-accent font-semibold">Log in</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
