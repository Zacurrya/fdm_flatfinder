export const LISTING_SHARE_PREFIX = "[{listing:";
export const LISTING_SHARE_SUFFIX = "}]";

export function encodeListingShareMessage(listingId: number): string {
  return `${LISTING_SHARE_PREFIX}${listingId}${LISTING_SHARE_SUFFIX}`;
}

export function decodeListingShareMessage(content: string): number | null {
  const normalized = content.trim();
  const match = normalized.match(/^\[\{listing:(\d+)\}\]$/i);
  if (!match) {
    return null;
  }

  const listingId = Number(match[1]);
  return Number.isInteger(listingId) && listingId > 0 ? listingId : null;
}
