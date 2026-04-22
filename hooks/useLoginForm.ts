import { useAuth } from "@hooks/useAuth";
import { useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useLoginForm() {
  const { login, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const isBusy = isSubmitting || isResettingPassword;

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
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    }else {
      setPasswordError("");
    }

    return valid;
  };

  const handleLogin = async (): Promise<boolean> => {
    const trimmedEmail = email.trim();

    if (!validate(trimmedEmail)) return false;

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await login({ email: trimmedEmail, password });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error ?? "Unable to sign in. Please try again.");
      return false;
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

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setIsResettingPassword(true);
    setErrorMessage("");

    const result = await resetPassword({ email: trimmedEmail });

    setIsResettingPassword(false);

    if (!result.success) {
      setErrorMessage(result.error ?? "Unable to send password reset email.");
    }
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
  };
}
