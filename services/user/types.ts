
export type ResolvedProfilePictureSource = {
    path: string | null;
    directUrl: string | null;
};

export type ProfilePictureFallbackOptions = {
    firstName?: string;
    lastName?: string;
    size?: number;
};

export type GetProfilePictureUrlOptions = ProfilePictureFallbackOptions & {
    profilePicture?: string | null;
    expiresInSeconds?: number;
};

// -- DTOs --

export type SetCacheUrlDTO = {
    path: string;
    url: string;
    expiresInSeconds: number;
};

export type ProfilePictureUploadDTO = {
    imageUri: string;
    mimeType?: string;
    fileName?: string;
};

export type OfficeLocationChangeDTO = {
    authUserId: string;
    officeLocation: string;
    oldCity: string;
};

export type FavouriteDTO = {
    userId: string;
    listingId: number;
};
