// Regex to match typical image formats or Supabase storage buckets natively.
// Extracted out to allow for robust testing and easy additions (eg video formats).
export const IMAGE_URL_REGEX = /(https?:\/\/[^\s]+(\.(png|jpe?g|gif|webp|heic)(\?.*)?|\/storage\/v1\/object\/public\/[^\s]+))/i;

/**
 * Validates if the message content string contains an image link anywhere inside it.
 * This is incredibly useful for parsing Message component typings.
 */
export const isImagePayload = (content: string): boolean => {
  return IMAGE_URL_REGEX.test(content);
};

/**
 * Validates if the message payload is actually an internal system audit log.
 * Example payload: "[AUDIT] User joined the channel"
 */
export const isAuditPayload = (content: string): boolean => {
  return content.startsWith("[AUDIT]") || content.startsWith("System:");
};

/**
 * Extracts the explicit textual message from an audit log payload by stripping the prefixes.
 */
export const extractAuditMessage = (content: string): string => {
  return content.replace(/^(\[AUDIT\]|System:)\s*/i, "").trim();
};
