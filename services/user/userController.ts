import {
    AuthResponse,
    ProfilePictureUploadDTO,
    User,
} from "@services/auth/auth.types";
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
