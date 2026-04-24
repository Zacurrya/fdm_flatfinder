import RegisterForm from "@components/auth/RegisterForm";
import BackButton from "@components/ui/BackButton";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import FDMLoader from "@components/ui/FDMLoader";
import { useRegisterForm } from "@hooks/auth/useRegisterForm";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, Platform, View, useWindowDimensions } from "react-native";

const Register = () => {
  const { width, height } = useWindowDimensions();
  const form = useRegisterForm();

  if (form.isSubmitting) {
    return (
      <View className="flex-1 bg-fdm-bg p-6">
        <FDMLoader />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-fdm-bg p-6"
    >
      <StatusBar style="light" hidden={width > height} />

      <BackgroundCircle y={-100} x="90%" size={288} color="#CCFF001A" opacity={0.5} />
      <BackgroundCircle y="90%" x={-100} size={384} color="#CCFF000D" opacity={0.4} />

      {/* Header */}
      <View className={`${width > height ? "pt-4" : "pt-10"} pb-2 w-full max-w-sm self-center flex-row items-center z-10`}>
        <BackButton />
      </View>

      <RegisterForm
        values={form.values}
        errors={form.errors as any} // cast to avoid strict typing issues with FormErrors if any
        isSubmitting={form.isSubmitting}
        onChange={form.onChange}
        clearErrorMessage={form.clearFormError}
        onSubmit={form.handleSubmit}
        onPressLogin={form.handleGoToLogin}
      />
    </KeyboardAvoidingView>
  );
};

export default Register;
