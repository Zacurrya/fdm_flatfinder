import { useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTERNATIONAL_PHONE_PATTERN = /^\+[1-9]\d{0,3}(?:[\s().-]*\d)+$/;

export type RegisterFormStep1Data = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export function useRegisterForm() {
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

  const clearFormError = () => {
    if (formError) setFormError("");
  };

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    if (firstNameError) setFirstNameError("");
    clearFormError();
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    if (lastNameError) setLastNameError("");
    clearFormError();
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError("");
    clearFormError();
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    if (phoneNumberError) setPhoneNumberError("");
    clearFormError();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) setPasswordError("");
    if (confirmPasswordError) setConfirmPasswordError("");
    clearFormError();
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordError) setConfirmPasswordError("");
    clearFormError();
  };

  /**
   * Validates all fields. Returns the trimmed form data on success, or null
   * if validation fails (field errors are set as a side-effect).
   */
  const validate = (): RegisterFormStep1Data | null => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
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
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
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
    } else if (!INTERNATIONAL_PHONE_PATTERN.test(trimmedPhoneNumber)) {
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
      return null;
    }

    return {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail,
      phoneNumber: trimmedPhoneNumber,
      password,
    };
  };

  /**
   * Validates step 1. On success, calls `onValidated` with the clean form data
   * so the screen can handle navigation without the hook depending on expo-router.
   */
  const handleSubmit = (onValidated: (data: RegisterFormStep1Data) => void): void => {
    const data = validate();
    if (data) onValidated(data);
  };

  return {
    // Field values
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    confirmPassword,
    // Field errors
    firstNameError,
    lastNameError,
    emailError,
    phoneNumberError,
    passwordError,
    confirmPasswordError,
    formError,
    // Handlers
    handleFirstNameChange,
    handleLastNameChange,
    handleEmailChange,
    handlePhoneNumberChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    clearFormError: () => setFormError(""),
    handleSubmit,
  };
}
