import { PropertyType, RentPeriod } from "@/types/enums";

// --- Chat Listing Share ---
export const LISTING_SHARE_PREFIX = "[{listing:";
export const LISTING_SHARE_SUFFIX = "}]";

/**
 * Encodes a listing ID into a special format for sharing in chat.
 */
export const encodeListingShareMessage = (listingId: string): string => {
  return `${LISTING_SHARE_PREFIX}${listingId}${LISTING_SHARE_SUFFIX}`;
};

// --- Media & Payload Parsing ---
export const IMAGE_URL_REGEX = /(https?:\/\/[^\s]+(\.(png|jpe?g|gif|webp|heic)(\?.*)?|\/storage\/v1\/object\/public\/[^\s]+))/i;

/**
 * Validates if the message content string contains an image link anywhere inside it.
 */
export const isImagePayload = (content: string): boolean => {
  return IMAGE_URL_REGEX.test(content);
};

/**
 * Validates if the message payload is actually an internal system audit log.
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

// --- Formatting Helpers ---

/**
 * Extracts initials from a full name or specific first/last name parts.
 */
export const getInitials = (firstName: string, lastName: string): string => {
  if (!firstName) return "";
  if (!lastName) return firstName[0].toUpperCase();
  return (firstName[0] + lastName[0]).toUpperCase();
};

/**
 * Formats an ISO string into an HH:MM time string based on the user's locale.
 */
export const formatTime = (isoString: string): string => {
  return new Date(isoString).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Formats a given date relative to today.
 */
export const formatRelativeDate = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();

  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return formatTime(isoString);
  }

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

/**
 * Handles the extraction and cleaning of photo URLs from legacy string/JSON data or standard arrays.
 */
export const parsePhotoUrls = (photos: any): string[] => {
  if (!photos) return [];

  let rawPhotos: string[] = [];

  if (Array.isArray(photos)) {
    rawPhotos = photos;
  } else if (typeof photos === 'string') {
    try {
      rawPhotos = JSON.parse(photos);
    } catch {
      const matches = photos.match(/https?:\/\/[^,}\]]+/g);
      if (matches) rawPhotos = matches;
    }
  }

  return rawPhotos
    .map(url => url ? String(url).replace(/^"|"$/g, '').trim() : '')
    .filter(url => url.startsWith('http'));
};

/**
 * Formats the rent period for display.
 */
export const formatRentPeriod = (period: RentPeriod) => {
  if (period === RentPeriod.WEEKLY) return "pw";
  if (period === RentPeriod.BIWEEKLY) return "biwk";
  return "pcm";
};

/**
 * Formats the property type for display.
 */
export const formatPropertyType = (type: PropertyType) => {
  if (!type) return "Property";
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};