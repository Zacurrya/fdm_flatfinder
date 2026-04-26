/**
 * Type guard to check if a value is a non-empty string after trimming.
 * Useful for validating user input like IDs, content, or names.
 */
export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * Type guard to check if a value is a positive integer > 0.
 * Useful for validating database IDs.
 */
export const isPositiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

/**
 * Type definition for errors returned by Supabase methods globally.
 */
export type SupabaseErrorLike = {
  message: string;
};

// -- Validation settings --
const passwordMinLength = 8;
const passwordMaxLength = 20;
const messageMinLength = 1;
const messageMaxLength = 500;

// -- Validators -- 
export const required = (value: string) => {
    return value.trim().length > 0;
}

export const email = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export const fdmEmail = (email: string) => {
    return email.toLowerCase().endsWith("@fdmgroup.com");
}

export const password = (password: string) => {
    // Outside length bounds?
    if (password.length < passwordMinLength || password.length > passwordMaxLength) return false;
    // Contains capital letter?
    if (!/[A-Z]/.test(password)) return false;
    // Contains number?
    if (!password.split('').some(char => char.match(/[0-9]/))) return false;
    // Contains special character?
    if (!password.split('').some(char => char.match(/[^a-zA-Z0-9]/))) return false;

    return true;
}

export const name = (name: string) => {
    return required(name);
}

export const phone = (phone: string) => {
    const internationalPhonePattern = /^\+[1-9]\d{0,3}(?:[\s().-]*\d)+$/;
    return internationalPhonePattern.test(phone);
}

export const message = (message: string) => {
    // Outside message bounds?
    if (message.trim().length < messageMinLength || message.trim().length > messageMaxLength) return false;

    return true;
}

// -- Listing validation --
export const validateListingInput = ({
    title,
    city,
    address,
    price,
}: {
    title: string;
    city: string;
    address: string;
    price: string;
}) => {
    if (!required(title) || !required(city) || !required(address) || !required(price)) {
        return {
            valid: false,
            error: "Please fill in all required fields.",
        };
    }
    return { valid: true };
};

// -- Listing field validators (return error string or null) --
export const fields = {
    title: (value: string) => {
        if (!value.trim()) return "Property title cannot be empty.";
        return null;
    },
    description: (value: string) => {
        if (!value.trim()) return "Description cannot be empty.";
        return null;
    },
    address: (value: string) => {
        if (!value.trim()) return "Property address cannot be empty.";
        return null;
    },
    rentAmount: (value: number) => {
        if (value <= 0) return "Rent amount must be greater than 0.";
        return null;
    },
    photos: (photos: string[]) => {
        if (photos.length === 0) return "You must include at least one photo.";
        return null;
    },
    bedrooms: (value: number | null) => {
        if (value === null || value <= 0) return "Select the number of bedrooms.";
        return null;
    },
    bathrooms: (value: number | null) => {
        if (value === null || value <= 0) return "Select the number of bathrooms.";
        return null;
    },
    cityExists: async (city: string, checkFn: (city: string) => Promise<boolean>) => {
        const exists = await checkFn(city);
        if (!exists) return `"${city}" is not a recognised FDM office city.`;
        return null;
    },
};
