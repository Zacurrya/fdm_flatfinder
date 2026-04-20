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
