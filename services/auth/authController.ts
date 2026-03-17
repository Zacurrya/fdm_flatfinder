import { Session } from "@supabase/supabase-js";
import { AuthResponse, LoginDTO } from "./auth.types";
import * as AuthService from "./authService";

export const registerUser = async (
    request: RegisterDTO
) => {
    return AuthService.register(request);
};

export const login = async (
    request: LoginDTO
): Promise<AuthResponse<Session>> => {
    return AuthService.login(request.email, request.password);
};

export const approveUser = async () => { };
export const deleteUser = async () => { };
export const resetPassword = async () => { };
export const logout = async () => { };