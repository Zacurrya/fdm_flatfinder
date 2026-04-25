import { PropertyType, RentPeriod } from "@/types/enums";

/**
 * Extracts initials from a full name or specific first/last name parts.
 * @param firstName The user's first name or full name.
 * @param lastName Optional last name.
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return (firstName![0]) + (lastName![0]).toUpperCase();
};

/**
 * Formats an ISO string into an HH:MM time string based on the user's locale.
 * @param isoString An ISO datestring.
 * @returns Localized time, e.g., "14:35"
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
 * If today: returns just the time (e.g. "14:05").
 * If yesterday: returns "Yesterday".
 * Older: returns Day + Month (e.g., "14 Jan").
 * @param isoString An ISO datestring.
 * @returns Relative formatted string.
 */
export const formatRelativeDate = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();

  // Create date objects with time set to midnight for calendar day comparison
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return formatTime(isoString);
  }
  if (diffDays === 1) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

/**
 * Handles the extraction and cleaning of photo URLs from legacy string/JSON data
 * or standard arrays.
 * @param photos Raw photos data (could be string, JSON, or array)
 * @returns Cleaned array of URL strings
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
      // Handle legacy string format with regex if JSON parsing fails
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
}

/**
 * Formats the property type for display.
 */
export const formatPropertyType = (type: PropertyType) => {
  if (!type) return "Property";
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}