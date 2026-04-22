// EMAIL REGEX
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// PASSWORD REGEX (at least 8 chars, one uppercase, one number, one special char)
export const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// INTERNATIONAL PHONE REGEX
export const internationalPhonePattern = /^\+[1-9]\d{0,3}(?:[\s().-]*\d)+$/;

export const hasUppercaseLetter = (password: string) => /[A-Z]/.test(password);
export const hasSymbol = (password: string) => /[^A-Za-z0-9\s]/.test(password);