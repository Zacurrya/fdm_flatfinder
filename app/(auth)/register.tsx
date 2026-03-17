import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, TouchableOpacity, View } from "react-native";

// Component Imports
import RegisterForm from "./components/RegisterForm";

export default function Register() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmitStepOne = () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;

    setFormError("");

    if (!trimmedFirstName) {
      setFirstNameError("First name is required.");
      isValid = false;
    } else {
      setFirstNameError("");
    }

    if (!trimmedLastName) {
      setLastNameError("Last name is required.");
      isValid = false;
    } else {
      setLastNameError("");
    }

    if (!trimmedEmail) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!emailPattern.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!trimmedPhoneNumber) {
      setPhoneNumberError("Phone number is required.");
      isValid = false;
    } else {
      setPhoneNumberError("");
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    if (!isValid) {
      setFormError("Please fix the highlighted fields before continuing.");
      return;
    }

    router.push("/(auth)/office-location");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-fdm-bg p-6"
    >
      <StatusBar style="light" />

      {/* Decorative Background Elements */}
      <View className="absolute top-[-100px] right-[-100px] w-72 h-72 bg-fdm-accent/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <View className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-fdm-accent/5 rounded-full blur-3xl opacity-40 pointer-events-none" />

      {/* Header */}
      <View className="pt-10 pb-2 w-full max-w-sm self-center flex-row items-center z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 items-center justify-center rounded-full bg-fdm-fg/10 active:bg-fdm-fg/20 border border-fdm-fg/10"
        >
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>
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
        setFirstName={setFirstName}
        setLastName={setLastName}
        setEmail={setEmail}
        setPhoneNumber={setPhoneNumber}
        setPassword={setPassword}
        setConfirmPassword={setConfirmPassword}
        onSubmitStepOne={handleSubmitStepOne}
      />
    </KeyboardAvoidingView>
  );
}
