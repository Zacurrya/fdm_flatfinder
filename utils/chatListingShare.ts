export const LISTING_SHARE_PREFIX = "[{listing:";
export const LISTING_SHARE_SUFFIX = "}]";

export const encodeListingShareMessage = (listingId: string): string => {
  return `${LISTING_SHARE_PREFIX}${listingId}${LISTING_SHARE_SUFFIX}`;
}

