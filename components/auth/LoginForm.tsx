import AuthButton from "@components/auth/AuthButton";
import EmailInput from "@components/auth/EmailInput";
import PasswordInput from "@components/auth/PasswordInput";
import {
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
  onPressResetPassword: () => void;
  onPressRegister: () => void;
};

const LoginForm = ({
  email,
  password,
  emailError,
  passwordError,
  errorMessage,
  isSubmitting = false,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onPressResetPassword,
  onPressRegister,
}: LoginFormProps) => {
  return (
    <View className="flex-1 w-full max-w-sm self-center justify-center z-10 mb-12">
      <View className="items-center mt-3 mb-10 w-full">
        <Text
          className="text-fdm-fg text-3xl mb-3 tracking-tighter text-center"
          style={{ fontFamily: "Michroma_400Regular" }}
        >
          Welcome <Text className="text-fdm-accent">Back</Text>
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
          placeholder="*********"
          error={passwordError}
          autoComplete="password"
          textContentType="password"
          editable={!isSubmitting}
        />
      </View>

      <TouchableOpacity
        className="self-end mt-3"
        onPress={onPressResetPassword}
        disabled={isSubmitting}
      >
        <Text className="text-fdm-accent font-semibold text-sm">Forgot password?</Text>
      </TouchableOpacity>

      {errorMessage ? <Text className="text-red-400 text-sm mt-4">{errorMessage}</Text> : null}

      <AuthButton
        label="Log In"
        onPress={onSubmit}
        isLoading={isSubmitting}
        backgroundColour="#ccff00"
        textColour="#1b1b1b"
        width="66.666667%" // matches w-2/3
        style={{ alignSelf: 'center', marginTop: 32 }} // mt-8
      />

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
};

export default LoginForm;
