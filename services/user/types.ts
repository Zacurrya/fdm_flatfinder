// -- DTOs --

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
