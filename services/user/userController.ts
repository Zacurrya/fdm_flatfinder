import {
    AuthResponse,
    GetProfilePictureUrlOptions,
    ProfilePictureFallbackOptions,
    ProfilePictureUploadDTO,
    ResolvedProfilePictureSource,
    User,
    UserEmailMapResult,
} from "./types";
import * as UserService from "./userService";

function requireNonEmpty(value: string | undefined | null, fieldName: string): string | null {
    const normalized = value?.trim() ?? "";
    if (!normalized) {
        return `${fieldName} is required.`;
    }

    return null;
}

function ensurePositiveNumber(value: unknown, fieldName: string): string | null {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return `${fieldName} must be a positive number.`;
    }

    return null;
}

export const getPendingUsers = async (): Promise<AuthResponse<User[]>> => {
    return UserService.getPendingUsers();
};

export const getUserProfile = async (
    authUserId: string
): Promise<AuthResponse<User>> => {
    const authUserIdError = requireNonEmpty(authUserId, "User ID");
    if (authUserIdError) {
        return { success: false, error: authUserIdError };
    }

    return UserService.getUserProfile(authUserId.trim());
};

export const getUserEmailMapByIds = async (
    userIds: string[]
): Promise<UserEmailMapResult> => {
    if (!Array.isArray(userIds)) {
        return { success: false, error: "User IDs payload is invalid." };
    }

    const normalizedUserIds = userIds
        .map((userId) => userId?.trim() ?? "")
        .filter(Boolean);

    return UserService.getUserEmailMapByIds(normalizedUserIds);
};

export const uploadProfilePicture = async (
    authUserId: string,
    upload: ProfilePictureUploadDTO
): Promise<AuthResponse<string>> => {
    const authUserIdError = requireNonEmpty(authUserId, "User ID");
    if (authUserIdError) {
        return { success: false, error: authUserIdError };
    }

    if (!upload) {
        return { success: false, error: "Profile picture payload is required." };
    }

    const imageUriError = requireNonEmpty(upload.imageUri, "Image URI");
    if (imageUriError) {
        return { success: false, error: imageUriError };
    }

    return UserService.uploadProfilePicture(authUserId.trim(), {
        ...upload,
        imageUri: upload.imageUri.trim(),
    });
};

export const removeProfilePicture = async (
    authUserId: string
): Promise<AuthResponse> => {
    const authUserIdError = requireNonEmpty(authUserId, "User ID");
    if (authUserIdError) {
        return { success: false, error: authUserIdError };
    }

    return UserService.removeProfilePicture(authUserId.trim());
};

export const requestOfficeLocationChange = async (
    authUserId: string,
    officeLocation: string
): Promise<AuthResponse> => {
    const authUserIdError = requireNonEmpty(authUserId, "User ID");
    if (authUserIdError) {
        return { success: false, error: authUserIdError };
    }

    const officeLocationError = requireNonEmpty(officeLocation, "Office location");
    if (officeLocationError) {
        return { success: false, error: officeLocationError };
    }

    const normalizedOfficeLocation = officeLocation.trim();
    const profileResult = await UserService.getUserProfile(authUserId.trim());
    if (!profileResult.success || !profileResult.data) {
        return { success: false, error: profileResult.error ?? "Failed to fetch current profile." };
    }

    if (profileResult.data.officeLocation.toLowerCase() === normalizedOfficeLocation.toLowerCase()) {
        return { success: false, error: "New city must be different from your current city." };
    }

    return UserService.requestOfficeLocationChange(authUserId.trim(), normalizedOfficeLocation);
};

export const addFavourite = async (
    userId: string,
    listingId: number
): Promise<AuthResponse> => {
    const userIdError = requireNonEmpty(userId, "User ID");
    if (userIdError) {
        return { success: false, error: userIdError };
    }

    const listingIdError = ensurePositiveNumber(listingId, "Listing ID");
    if (listingIdError) {
        return { success: false, error: listingIdError };
    }

    return UserService.addFavourite(userId.trim(), Number(listingId));
};

export const removeFavourite = async (
    userId: string,
    listingId: number
): Promise<AuthResponse> => {
    const userIdError = requireNonEmpty(userId, "User ID");
    if (userIdError) {
        return { success: false, error: userIdError };
    }

    const listingIdError = ensurePositiveNumber(listingId, "Listing ID");
    if (listingIdError) {
        return { success: false, error: listingIdError };
    }

    return UserService.removeFavourite(userId.trim(), Number(listingId));
};

export const getUserFavourites = async (
    userId: string
): Promise<AuthResponse<number[]>> => {
    const userIdError = requireNonEmpty(userId, "User ID");
    if (userIdError) {
        return { success: false, error: userIdError };
    }

    return UserService.getUserFavourites(userId.trim());
};

export const getFallbackProfilePictureInitials = (
    options: ProfilePictureFallbackOptions = {}
): string => {
    return UserService.getFallbackProfilePictureInitials(options);
};

export const getFallbackProfilePictureUrl = (
    options: ProfilePictureFallbackOptions = {}
): string => {
    return UserService.getFallbackProfilePictureUrl(options);
};

export const resolveProfilePictureSource = (
    profilePicture?: string | null
): ResolvedProfilePictureSource => {
    return UserService.resolveProfilePictureSource(profilePicture);
};

export const getProfilePictureUrl = async (
    options: GetProfilePictureUrlOptions = {}
): Promise<string> => {
    return UserService.getProfilePictureUrl(options);
};