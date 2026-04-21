import { User, ProfilePictureUploadDTO, AuthResponse } from "@services/auth/types";

export type { User, ProfilePictureUploadDTO, AuthResponse };

export type UserEmailMapResult = {
    success: boolean;
    data?: Record<string, string>;
    error?: string;
};

export type ResolvedProfilePictureSource = {
    path: string | null;
    directUrl: string | null;
};

export type ProfilePictureFallbackOptions = {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    size?: number;
};

export type GetProfilePictureUrlOptions = ProfilePictureFallbackOptions & {
    profilePicture?: string | null;
    expiresInSeconds?: number;
};
