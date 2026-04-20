import {
    AuthResponse,
    ProfilePictureUploadDTO,
    User,
} from "@services/auth/auth.types";
import type {
    GetProfilePictureUrlOptions,
    ProfilePictureFallbackOptions,
} from "./userService";
import * as UserService from "./userService";

// Get Pending Users (Admin)

export const getPendingUsers = async (): Promise<
    AuthResponse<User[]>
> => {
    return UserService.getPendingUsers();
};

export const getUserProfile = async (
    authUserId: string
): Promise<AuthResponse<User>> => {
    if (!authUserId) {
        return { success: false, error: "User ID is required." };
    }

    return UserService.getUserProfile(authUserId);
};

// Upload Profile Picture

export const uploadProfilePicture = async (
    authUserId: string,
    upload: ProfilePictureUploadDTO
): Promise<AuthResponse<string>> => {
    if (!authUserId) {
        return { success: false, error: "User ID is required." };
    }

    if (!upload.imageUri) {
        return { success: false, error: "Image URI is required." };
    }

    return UserService.uploadProfilePicture(authUserId, upload);
};

export const removeProfilePicture = async (
    authUserId: string
): Promise<AuthResponse> => {
    if (!authUserId) {
        return { success: false, error: "User ID is required." };
    }

    return UserService.removeProfilePicture(authUserId);
};

export const requestOfficeLocationChange = async (
    authUserId: string,
    officeLocation: string
): Promise<AuthResponse> => {
    if (!authUserId) {
        return { success: false, error: "User ID is required." };
    }

    if (!officeLocation.trim()) {
        return { success: false, error: "Office location is required." };
    }

    return UserService.requestOfficeLocationChange(authUserId, officeLocation.trim());
};

export const addFavourite = async (
    authUserId: string,
    listingId: number
): Promise<AuthResponse> => {
    if (!authUserId) {
        return { success: false, error: "User ID is required." };
    }

    if (!Number.isFinite(listingId) || listingId <= 0) {
        return { success: false, error: "Listing ID must be a positive number." };
    }

    return UserService.addFavourite(authUserId, listingId);
};

export const removeFavourite = async (
    authUserId: string,
    listingId: number
): Promise<AuthResponse> => {
    if (!authUserId) {
        return { success: false, error: "User ID is required." };
    }

    if (!Number.isFinite(listingId) || listingId <= 0) {
        return { success: false, error: "Listing ID must be a positive number." };
    }

    return UserService.removeFavourite(authUserId, listingId);
};

export const getUserFavourites = async (
    authUserId: string
): Promise<AuthResponse<number[]>> => {
    if (!authUserId) {
        return { success: false, error: "User ID is required." };
    }

    return UserService.getUserFavourites(authUserId);
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

export const getProfilePictureUrl = async (
    options: GetProfilePictureUrlOptions = {}
): Promise<string> => {
    return UserService.getProfilePictureUrl(options);
};
