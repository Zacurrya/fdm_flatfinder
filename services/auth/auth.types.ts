import { Enums } from "@/types/database.types";

// Enums

export type Role = Enums<"Role">;                     // "ADMIN" | "CONSULTANT"
export type ApprovalStatus = Enums<"ApprovalStatus">; // "PENDING" | "APPROVED" | "REJECTED"

// DTOs

export interface RegistrationDTO {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    officeLocation: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface LogoutDTO {
    userId: string;   // UUID
}

export interface ApprovalDTO {
    userId: string;   // UUID
}

export interface DeletionDTO {
    userId: string;   // UUID
}

export interface PasswordResetDTO {
    email: string;
}

// User Entity

export interface User {
    userId: string;           // UUID from auth.users
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    officeLocation: string;
    role: Role;
    approvalStatus: ApprovalStatus;
    createdAt: string;
}

// Responses

export interface AuthResponse<T = undefined> {
    success: boolean;
    data?: T;
    error?: string;
}
