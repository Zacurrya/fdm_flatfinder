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

/**
 * getPendingUsers
 * Loads all pending users awaiting moderation.
 *
 * @returns A response containing pending users.
 */
export const getPendingUsers = async (): Promise<AuthResponse<User[]>> => {
    return UserService.getPendingUsers();
};

/**
 * getUserProfile
 * Loads the profile for the given authenticated user ID.
 *
 * @param authUserId The user ID to load.
 * @returns A response containing the user profile.
 */
export const getUserProfile = async (
    authUserId: string
): Promise<AuthResponse<User>> => {
    const authUserIdError = requireNonEmpty(authUserId, "User ID");
    if (authUserIdError) {
        return { success: false, error: authUserIdError };
    }

    return UserService.getUserProfile(authUserId.trim());
};

/**
 * getUserEmailMapByIds
 * Resolves a set of user IDs into email address mappings.
 *
 * @param userIds The user IDs to resolve.
 * @returns A response containing the email map.
 */
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

/**
 * uploadProfilePicture
 * Validates and uploads a profile picture for the current user.
 *
 * @param authUserId The user ID owning the profile picture.
 * @param upload The upload payload.
 * @returns A response containing the uploaded picture URL.
 */
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

/**
 * removeProfilePicture
 * Removes the current user's profile picture.
 *
 * @param authUserId The user ID owning the profile picture.
 * @returns A response for the removal action.
 */
export const removeProfilePicture = async (
    authUserId: string
): Promise<AuthResponse> => {
    const authUserIdError = requireNonEmpty(authUserId, "User ID");
    if (authUserIdError) {
        return { success: false, error: authUserIdError };
    }

    return UserService.removeProfilePicture(authUserId.trim());
};

/**
 * requestOfficeLocationChange
 * Validates and submits a city transfer request.
 *
 * @param authUserId The requesting user ID.
 * @param officeLocation The new office location.
 * @returns A response for the transfer request.
 */
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

    return UserService.requestOfficeLocationChange(authUserId.trim(), normalizedOfficeLocation, {
        oldCity: profileResult.data.officeLocation,
        role: profileResult.data.role,
    });
};

/**
 * addFavourite
 * Validates and saves a listing as a favourite for the user.
 *
 * @param userId The user ID performing the action.
 * @param listingId The listing ID to favourite.
 * @returns A response for the favourite action.
 */
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

/**
 * removeFavourite
 * Removes a listing from the user's favourites.
 *
 * @param userId The user ID performing the action.
 * @param listingId The listing ID to unfavourite.
 * @returns A response for the unfavourite action.
 */
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

/**
 * getUserFavourites
 * Loads the saved listing IDs for a user.
 *
 * @param userId The user ID to query.
 * @returns A response containing the user's favourite listing IDs.
 */
export const getUserFavourites = async (
    userId: string
): Promise<AuthResponse<number[]>> => {
    const userIdError = requireNonEmpty(userId, "User ID");
    if (userIdError) {
        return { success: false, error: userIdError };
    }

    return UserService.getUserFavourites(userId.trim());
};

/**
 * getFallbackProfilePictureInitials
 * Generates fallback initials for a profile picture placeholder.
 *
 * @param options Formatting options for the initials.
 * @returns The fallback initials string.
 */
export const getFallbackProfilePictureInitials = (
    options: ProfilePictureFallbackOptions = {}
): string => {
    return UserService.getFallbackProfilePictureInitials(options);
};

/**
 * getFallbackProfilePictureUrl
 * Generates a fallback avatar image URL.
 *
 * @param options Formatting options for the fallback URL.
 * @returns The fallback avatar URL.
 */
export const getFallbackProfilePictureUrl = (
    options: ProfilePictureFallbackOptions = {}
): string => {
    return UserService.getFallbackProfilePictureUrl(options);
};

/**
 * resolveProfilePictureSource
 * Converts a profile picture value into a resolved source descriptor.
 *
 * @param profilePicture The stored profile picture value.
 * @returns The resolved source metadata.
 */
export const resolveProfilePictureSource = (
    profilePicture?: string | null
): ResolvedProfilePictureSource => {
    return UserService.resolveProfilePictureSource(profilePicture);
};

/**
 * getProfilePictureUrl
 * Resolves a signed or fallback profile picture URL.
 *
 * @param options Lookup and fallback options.
 * @returns A resolved profile picture URL.
 */
export const getProfilePictureUrl = async (
    options: GetProfilePictureUrlOptions = {}
): Promise<string> => {
    return UserService.getProfilePictureUrl(options);
};