import LoginForm from "@components/auth/LoginForm";
import BackButton from '@components/ui/BackButton';
import BackgroundCircle from "@components/ui/BackgroundCircle";
import { useLoginForm } from "@hooks/auth/useLoginForm";
import { View, useWindowDimensions } from "react-native";

const Login = () => {
  const { width, height } = useWindowDimensions();
  const form = useLoginForm();

  return (
    <View className="flex-1 bg-fdm-bg p-6">
      <BackgroundCircle y={-100} x={-100} size={288} color="#CCFF001A" opacity={0.5} />
      <BackgroundCircle y="90%" x="90%" size={384} color="#CCFF000D" opacity={0.4} />

      {/* Header */}
      <View className={`${width > height ? "pt-4" : "pt-10"} pb-2 w-full max-w-sm self-center flex-row items-center z-10`}>
        <BackButton />
      </View>
      <LoginForm
        email={form.email}
        password={form.password}
        emailError={form.emailError}
        passwordError={form.passwordError}
        errorMessage={form.errorMessage}
        isSubmitting={form.isBusy}
        onEmailChange={form.handleEmailChange}
        onPasswordChange={form.handlePasswordChange}
        onSubmit={form.handleLogin}
        onPressResetPassword={form.handleResetPassword}
        onPressRegister={form.handleGoToRegister}
      />
    </View>
  )

};

export default Login;
