import RegisterForm from "@components/auth/RegisterForm";
import BackButton from "@components/ui/BackButton";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import { useRegisterForm } from "@hooks/useRegisterForm";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, Platform, View, useWindowDimensions } from "react-native";

export default function Register() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const {
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
    handleFirstNameChange,
    handleLastNameChange,
    handleEmailChange,
    handlePhoneNumberChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    clearFormError,
    handleSubmit,
  } = useRegisterForm();

  const onSubmit = () => {
    handleSubmit((data) => {
      router.push({
        pathname: "/(auth)/office-location",
        params: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: data.password,
        },
      });
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-fdm-bg p-6"
    >
      <StatusBar style="light" hidden={width > height} />

      <BackgroundCircle top={-100} right={-100} size={288} color="#CCFF001A" opacity={0.5} />
      <BackgroundCircle bottom={-100} left={-100} size={384} color="#CCFF000D" opacity={0.4} />

      <View
        className={`${width > height ? "pt-4" : "pt-10"} pb-2 w-full max-w-sm self-center flex-row items-center z-10`}
      >
        <BackButton />
      </View>

      <RegisterForm
        firstName={firstName}
        lastName={lastName}
        email={email}
        phoneNumber={phoneNumber}
        password={password}
        confirmPassword={confirmPassword}
        firstNameError={firstNameError}
        lastNameError={lastNameError}
        emailError={emailError}
        phoneNumberError={phoneNumberError}
        passwordError={passwordError}
        confirmPasswordError={confirmPasswordError}
        formError={formError}
        onFirstNameChange={handleFirstNameChange}
        onLastNameChange={handleLastNameChange}
        onEmailChange={handleEmailChange}
        onPhoneNumberChange={handlePhoneNumberChange}
        onPasswordChange={handlePasswordChange}
        onConfirmPasswordChange={handleConfirmPasswordChange}
        clearErrorMessage={clearFormError}
        onSubmit={onSubmit}
        onPressLogin={() => router.push("/(auth)/login")}
      />
    </KeyboardAvoidingView>
  );
}
