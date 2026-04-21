import {
    ApprovalDTO,
    AuthResponse,
    DeletionDTO,
    LoginDTO,
    PasswordResetDTO,
    RegistrationDTO,
    User,
} from "./types";
import { Session } from "@supabase/supabase-js";
import * as AuthService from "./authService";

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function requireNonEmpty(value: string | undefined | null, fieldName: string): string | null {
    const normalized = value?.trim() ?? "";
    if (!normalized) {
        return `${fieldName} is required.`;
    }

    return null;
}

function validateUserIdDto(dto: ApprovalDTO | DeletionDTO): string | null {
    return requireNonEmpty(dto?.userId, "User ID");
}

export const register = async (
    dto: RegistrationDTO
): Promise<AuthResponse> => {
    if (!dto) {
        return { success: false, error: "Registration payload is required." };
    }

    const validationError =
        requireNonEmpty(dto.firstName, "First name") ??
        requireNonEmpty(dto.lastName, "Last name") ??
        requireNonEmpty(dto.email, "Email") ??
        requireNonEmpty(dto.password, "Password") ??
        requireNonEmpty(dto.phoneNumber, "Phone number") ??
        requireNonEmpty(dto.officeLocation, "Office location");

    if (validationError) {
        return { success: false, error: validationError };
    }

    return AuthService.register({
        ...dto,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: normalizeEmail(dto.email),
        password: dto.password,
        phoneNumber: dto.phoneNumber.trim(),
        officeLocation: dto.officeLocation.trim(),
    });
};

export const login = async (
    dto: LoginDTO
): Promise<AuthResponse<{ session: Session; user: User }>> => {
    if (!dto) {
        return { success: false, error: "Login payload is required." };
    }

    const validationError =
        requireNonEmpty(dto.email, "Email") ??
        requireNonEmpty(dto.password, "Password");

    if (validationError) {
        return { success: false, error: validationError };
    }

    return AuthService.login(normalizeEmail(dto.email), dto.password);
};

export const logout = async (): Promise<AuthResponse> => {
    return AuthService.logout();
};

export const resetPassword = async (
    dto: PasswordResetDTO
): Promise<AuthResponse> => {
    if (!dto) {
        return { success: false, error: "Password reset payload is required." };
    }

    const validationError = requireNonEmpty(dto.email, "Email");
    if (validationError) {
        return { success: false, error: validationError };
    }

    return AuthService.resetPassword({ email: normalizeEmail(dto.email) });
};

export const approveUser = async (
    dto: ApprovalDTO
): Promise<AuthResponse> => {
    const validationError = validateUserIdDto(dto);
    if (validationError) {
        return { success: false, error: validationError };
    }

    return AuthService.approveUser({ userId: dto.userId.trim() });
};

export const rejectUser = async (
    dto: ApprovalDTO
): Promise<AuthResponse> => {
    const validationError = validateUserIdDto(dto);
    if (validationError) {
        return { success: false, error: validationError };
    }

    return AuthService.rejectUser({ userId: dto.userId.trim() });
};

export const deleteUser = async (
    dto: DeletionDTO
): Promise<AuthResponse> => {
    const validationError = validateUserIdDto(dto);
    if (validationError) {
        return { success: false, error: validationError };
    }

    return AuthService.deleteUser({ userId: dto.userId.trim() });
};