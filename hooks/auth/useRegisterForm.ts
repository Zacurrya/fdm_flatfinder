import { AuthService } from "@services/auth/authService";
import * as validateUtil from "@utils/inputValidation";
import { useRouter } from "expo-router";
import { useState } from "react";

export type RegisterFormStep1Data = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export const useRegisterForm = () => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFormError = () => {
    if (formError) setFormError("");
  };

  const handleChange = (field: string, value: any) => {
    switch (field) {
      case "firstName": setFirstName(value); if (firstNameError) setFirstNameError(""); break;
      case "lastName": setLastName(value); if (lastNameError) setLastNameError(""); break;
      case "email": setEmail(value); if (emailError) setEmailError(""); break;
      case "phoneNumber": setPhoneNumber(value); if (phoneNumberError) setPhoneNumberError(""); break;
      case "password":
        setPassword(value);
        if (passwordError) setPasswordError("");
        if (confirmPasswordError) setConfirmPasswordError("");
        break;
      case "confirmPassword": setConfirmPassword(value); if (confirmPasswordError) setConfirmPasswordError(""); break;
    }
    clearFormError();
  };

  /**
   * Validates all fields. Returns the trimmed form data on success, or null
   * if validation fails (field errors are set as a side-effect).
   */
  const validate = async (): Promise<RegisterFormStep1Data | null> => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhoneNumber = phoneNumber.trim();

    let isValid = true;
    setFormError("");

    if (!validateUtil.name(trimmedFirstName)) {
      setFirstNameError("First name is required.");
      isValid = false;
    } else {
      setFirstNameError("");
    }

    if (!validateUtil.name(trimmedLastName)) {
      setLastNameError("Last name is required.");
      isValid = false;
    } else {
      setLastNameError("");
    }

    if (!trimmedEmail) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!validateUtil.email(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      isValid = false;
    } else if (!validateUtil.fdmEmail(trimmedEmail)) {
      setEmailError("Use your @fdmgroup.com email address.");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!trimmedPhoneNumber) {
      setPhoneNumberError("Phone number is required.");
      isValid = false;
    } else if (!validateUtil.phone(trimmedPhoneNumber)) {
      setPhoneNumberError("Include a country code, e.g. +44 7700 900123.");
      isValid = false;
    } else {
      setPhoneNumberError("");
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (!validateUtil.password(password)) {
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

    // Check database for existing email or phone number
    try {
      const [emailExists, phoneExists] = await Promise.all([
        AuthService.emailExists(trimmedEmail),
        AuthService.phoneNumberExists(trimmedPhoneNumber)
      ]);

      let dbConflict = false;

      if (emailExists) {
        setEmailError("An account with this email already exists.");
        dbConflict = true;
      }

      if (phoneExists) {
        setPhoneNumberError("An account with this phone number already exists.");
        dbConflict = true;
      }

      if (dbConflict) {
        setFormError("Please fix the highlighted fields before continuing.");
        return null;
      }
    } catch (e) {
      console.error("Failed to check existing user:", e);
      setFormError("Unable to verify details. Please try again later.");
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
   * Validates step 1. On success, executes registration.
   */
  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true);
    const data = await validate();

    if (data) {
      router.push({
        pathname: "/(auth)/office-location",
        params: data,
      });
    }

    setIsSubmitting(false);
  };

  return {
    values: {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword,
    },
    errors: {
      firstName: firstNameError,
      lastName: lastNameError,
      email: emailError,
      phoneNumber: phoneNumberError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      form: formError,
    },
    isSubmitting,
    onChange: handleChange,
    clearFormError: () => setFormError(""),
    handleSubmit,
    handleGoToLogin: () => router.push("/(auth)/login"),
  };
}
