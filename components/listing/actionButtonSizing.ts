export type ListingActionButtonSizing = {
  iconSize: number;
  containerSize: number;
  borderRadius: number;
};

export function getListingActionButtonSizing(size: number = 20): ListingActionButtonSizing {
  const iconSize = Math.max(16, Math.round(size));
  const containerSize = Math.max(36, iconSize + 12);

  return {
    iconSize,
    containerSize,
    borderRadius: Math.round(containerSize / 2),
  };
}