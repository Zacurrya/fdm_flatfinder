import { useAuth } from "@hooks/useAuth";
import * as validateUtil from "@utils/inputValidation";
import { useRouter } from "expo-router";
import { useState } from "react";

export const useLoginForm = () => {
  const router = useRouter();
  const { login, isLoading, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const isBusy = isSubmitting || isResettingPassword || isLoading;

  const clearGlobalError = () => {
    if (errorMessage) setErrorMessage("");
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError("");
    clearGlobalError();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) setPasswordError("");
    clearGlobalError();
  };

  const validate = (trimmedEmail: string): boolean => {
    let valid = true;

    if (!trimmedEmail) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!validateUtil.email(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleLogin = async (): Promise<boolean> => {
    const trimmedEmail = email.trim();

    if (!validate(trimmedEmail)) return false;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await login({ email: trimmedEmail, password });
    } catch {
      setErrorMessage('Incorrect username or password. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }

    // Navigation is handled by RootNavigator in _layout.tsx
    return true;
  };

  const handleResetPassword = async (): Promise<void> => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Enter your email to reset your password.");
      return;
    }

    if (!validateUtil.email(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setIsResettingPassword(true);
    setErrorMessage("");

    await resetPassword(trimmedEmail);

    setIsResettingPassword(false);
  };

  return {
    // Field values
    email,
    password,
    // Field errors
    emailError,
    passwordError,
    errorMessage,
    // Loading state
    isBusy,
    isResettingPassword,
    // Handlers
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
    handleResetPassword,
    handleGoToRegister: () => router.push("/(auth)/register"),
  };
};
