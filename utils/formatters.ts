/**
 * Extracts the first two initials from a full name string, capitalised.
 * Useful for user avatars.
 * @param name The full name string (e.g., "John Doe")
 * @returns 1-2 character initials (e.g., "JD")
 */
export const getInitials = (name: string): string => {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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
