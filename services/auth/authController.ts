import { Session } from "@supabase/supabase-js";
import {
    ApprovalDTO,
    AuthResponse,
    DeletionDTO,
    LoginDTO,
    PasswordResetDTO,
    RegistrationDTO,
    User,
} from "./auth.types";
import * as AuthService from "./authService";

// Register

export const register = async (
    request: RegistrationDTO
): Promise<AuthResponse> => {
    const trimmedPhoneNumber = request.phoneNumber?.trim() ?? "";
    const internationalPhonePattern = /^\+[1-9]\d{0,3}(?:[\s().-]*\d)+$/;

    if (!request.email || !request.password) {
        return { success: false, error: "Email and password are required." };
    }
    if (!request.email.toLowerCase().endsWith("@fdmgroup.com")) {
        return { success: false, error: "Only @fdmgroup.com email addresses can sign up." };
    }
    if (!request.firstName || !request.lastName) {
        return { success: false, error: "First and last name are required." };
    }
    if (!trimmedPhoneNumber) {
        return { success: false, error: "Phone number is required." };
    }
    if (!internationalPhonePattern.test(trimmedPhoneNumber)) {
        return {
            success: false,
            error: "Phone number must include a country code, e.g. +44 7700 900123.",
        };
    }
    if (!request.officeLocation) {
        return { success: false, error: "Office location is required." };
    }

    return AuthService.register(request);
};

// Login

export const login = async (
    request: LoginDTO
): Promise<AuthResponse<{ session: Session; user: User }>> => {
    if (!request.email || !request.password) {
        return { success: false, error: "Email and password are required." };
    }

    return AuthService.login(request.email, request.password);
};

// Logout 

export const logout = async (): Promise<AuthResponse> => {
    return AuthService.logout();
};

// Password Reset 

export const resetPassword = async (
    request: PasswordResetDTO
): Promise<AuthResponse> => {
    if (!request.email) {
        return { success: false, error: "Email is required." };
    }

    return AuthService.resetPassword(request);
};

// Approve User (Admin)

export const approveUser = async (
    request: ApprovalDTO
): Promise<AuthResponse> => {
    if (!request.userId) {
        return { success: false, error: "User ID is required." };
    }

    return AuthService.approveUser(request);
};

// Reject User (Admin) 

export const rejectUser = async (
    request: ApprovalDTO
): Promise<AuthResponse> => {
    if (!request.userId) {
        return { success: false, error: "User ID is required." };
    }

    return AuthService.rejectUser(request);
};

// Delete User (Admin)

export const deleteUser = async (
    request: DeletionDTO
): Promise<AuthResponse> => {
    if (!request.userId) {
        return { success: false, error: "User ID is required." };
    }

    return AuthService.deleteUser(request);
};

// Get User Profile

export const getUserProfile = async (
    authUserId: string
): Promise<AuthResponse<User>> => {
    if (!authUserId) {
        return { success: false, error: "User ID is required." };
    }

    return AuthService.getUserProfile(authUserId);
};

