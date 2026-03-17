// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface LoginDTO {
    email: string;
    password: string;
}

// ─── Responses ───────────────────────────────────────────────────────────────

export interface AuthResponse<T = undefined> {
    success: boolean;
    data?: T;
    error?: string;
}
