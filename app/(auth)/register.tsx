import BackButton from "@/components/ui/BackButton";
import RegisterForm from "@components/auth/RegisterForm";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

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

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    if (firstNameError) {
      setFirstNameError("");
    }
    if (formError) {
      setFormError("");
    }
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    if (lastNameError) {
      setLastNameError("");
    }
    if (formError) {
      setFormError("");
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError("");
    }
    if (formError) {
      setFormError("");
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    if (phoneNumberError) {
      setPhoneNumberError("");
    }
    if (formError) {
      setFormError("");
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      setPasswordError("");
    }
    if (confirmPasswordError) {
      setConfirmPasswordError("");
    }
    if (formError) {
      setFormError("");
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordError) {
      setConfirmPasswordError("");
    }
    if (formError) {
      setFormError("");
    }
  };

  const handleSubmitStepOne = () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const internationalPhonePattern = /^\+[1-9]\d{0,3}(?:[\s().-]*\d)+$/;
    const isFdmEmail = trimmedEmail.toLowerCase().endsWith("@fdmgroup.com");
    const hasUppercaseLetter = /[A-Z]/.test(password);
    const hasSymbol = /[^A-Za-z0-9\s]/.test(password);
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
    } else if (!isFdmEmail) {
      setEmailError("Use your @fdmgroup.com email address.");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!trimmedPhoneNumber) {
      setPhoneNumberError("Phone number is required.");
      isValid = false;
    } else if (!internationalPhonePattern.test(trimmedPhoneNumber)) {
      setPhoneNumberError("Include a country code, e.g. +44 7700 900123.");
      isValid = false;
    } else {
      setPhoneNumberError("");
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 8 || !hasUppercaseLetter || !hasSymbol) {
      setPasswordError(
        "Password must be at least 8 characters and include an uppercase letter and a symbol."
      );
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

    // Pass validated form data to the office-location step via route params
    router.push({
      pathname: "/(auth)/office-location",
      params: {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        phoneNumber: trimmedPhoneNumber,
        password,
      },
    });
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
        onSubmit={handleSubmitStepOne}
        onPressLogin={() => router.push("/(auth)/login")}
      />
    </KeyboardAvoidingView>
  );
}
