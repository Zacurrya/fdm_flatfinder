import AuthButton from "@components/auth/AuthButton";
import EmailInput from "@components/auth/EmailInput";
import PasswordInput from "@components/auth/PasswordInput";
import PhoneNumberInput from "@components/auth/PhoneNumberInput";
import Field from "@components/ui/Field";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// -- Types --

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

type RegisterFormProps = {
  values: FormValues;
  errors: FormErrors;
  isSubmitting?: boolean;
  onChange: (field: keyof FormValues, value: string) => void;
  onSubmit: () => void;
  onPressLogin: () => void;
  clearErrorMessage?: () => void;
};

const RegisterForm = ({
  values,
  errors,
  isSubmitting = false,
  onChange,
  onSubmit,
  onPressLogin,
  clearErrorMessage,
}: RegisterFormProps) => {
  const handleChange = (field: keyof FormValues) => (value: string) => {
    onChange(field, value);
    clearErrorMessage?.();
  };

  return (
    <ScrollView
      className="flex-1 w-full max-w-sm self-center z-10"
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

      <View className="w-full gap-4" style={{ marginBottom: 36 }}>
        {/* Name fields */}
        <View className="flex-row gap-4">
          <Field
            label="First Name"
            value={values.firstName}
            onChangeText={handleChange("firstName")}
            placeholder="Jane"
            error={errors.firstName}
            autoComplete="given-name"
            textContentType="givenName"
            editable={!isSubmitting}
            containerClassName="flex-1"
          />
          <Field
            label="Last Name"
            value={values.lastName}
            onChangeText={handleChange("lastName")}
            placeholder="Doe"
            error={errors.lastName}
            autoComplete="family-name"
            textContentType="familyName"
            editable={!isSubmitting}
            containerClassName="flex-1"
          />
        </View>

        <EmailInput
          value={values.email}
          onChangeText={handleChange("email")}
          error={errors.email}
          editable={!isSubmitting}
        />
        <PhoneNumberInput
          value={values.phoneNumber}
          onChangeText={handleChange("phoneNumber")}
          error={errors.phoneNumber}
          editable={!isSubmitting}
        />
        <PasswordInput
          label="Password"
          value={values.password}
          onChangeText={handleChange("password")}
          placeholder="Minimum 8 characters"
          error={errors.password}
          autoComplete="new-password"
          textContentType="newPassword"
          editable={!isSubmitting}
        />
        <PasswordInput
          label="Confirm Password"
          value={values.confirmPassword}
          onChangeText={handleChange("confirmPassword")}
          placeholder="Re-enter your password"
          error={errors.confirmPassword}
          autoComplete="new-password"
          textContentType="newPassword"
          editable={!isSubmitting}
        />
      </View>

      {errors.form ? <Text className="text-red-400 text-sm mt-4">{errors.form}</Text> : null}

      <AuthButton
        label="Continue"
        onPress={onSubmit}
        isLoading={isSubmitting}
        backgroundColour="#ccff00"
        textColour="#1b1b1b"
        width={220}
        style={{ alignSelf: 'center' }}
      />

      <TouchableOpacity className="self-center mt-6" onPress={onPressLogin} disabled={isSubmitting}>
        <Text className="text-fdm-fg/70">
          Already have an account?{" "}
          <Text className="text-fdm-accent font-semibold">Log in</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default RegisterForm;