import { supabase } from "@lib/supabase";
import * as AuthController from "@services/auth/authController";
import {
    AuthResponse,
    LoginDTO,
    PasswordResetDTO,
    ProfilePictureUploadDTO,
    RegistrationDTO,
    User,
} from "@services/auth/types";
import * as UserController from "@services/user/userController";
import { Session } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

// Context Definition 

interface AuthContextType {
    // The current Supabase session, null when logged out
    session: Session | null;
    // The user's profile from the Users table, null when logged out
    user: User | null;
    // True while the initial session is being restored
    isLoading: boolean;

    // Refetch the current user profile from the Users table
    refreshUser: () => Promise<AuthResponse<User>>;
    // Sign in with email + password
    login: (dto: LoginDTO) => Promise<AuthResponse<{ session: Session; user: User }>>;
    // Create a new account
    register: (dto: RegistrationDTO) => Promise<AuthResponse>;
    // Sign out and clear the session
    logout: () => Promise<AuthResponse>;
    // Send a password reset email
    resetPassword: (dto: PasswordResetDTO) => Promise<AuthResponse>;
    // Upload and persist a new profile picture for the current user
    updateProfilePicture: (upload: ProfilePictureUploadDTO) => Promise<AuthResponse<string>>;
    // Remove the current profile picture and fallback to generated avatar
    removeProfilePicture: () => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async (): Promise<AuthResponse<User>> => {
        if (!session?.user?.id) {
            return { success: false, error: "No active session." };
        }

        const result = await UserController.getUserProfile(session.user.id);
        if (result.success && result.data) {
            setUser(result.data);
        }

        return result;
    };

    useEffect(() => {
        const hydrateSession = async (currentSession: Session | null) => {
            setSession(currentSession);
            if (!currentSession?.user) {
                setUser(null);
            } else {
                const result = await UserController.getUserProfile(currentSession.user.id);
                if (result.success && result.data) {
                    setUser(result.data);
                }
            }
        };

        // Restore existing session on mount
        supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
            await hydrateSession(existingSession);
            setIsLoading(false);
        });

        // Listen for auth state changes (sign in, sign out, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                if (event === "SIGNED_OUT" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                    await hydrateSession(newSession);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);


    // Actions

    const login = async (dto: LoginDTO) => {
        const result = await AuthController.login(dto);

        if (result.success && result.data) {
            setSession(result.data.session);
            setUser(result.data.user);
        }

        return result;
    };
    
    const register = async (dto: RegistrationDTO) => {
        return AuthController.register(dto);
    };

    const logout = async () => {
        const result = await AuthController.logout();

        if (result.success) {
            setSession(null);
            setUser(null);
        }
        return result;
    };

    const resetPassword = async (dto: PasswordResetDTO) => {
        return AuthController.resetPassword(dto);
    };

    const updateProfilePicture = async (
        upload: ProfilePictureUploadDTO
    ): Promise<AuthResponse<string>> => {
        if (!session?.user?.id) {
            return { success: false, error: "No active session." };
        }

        const result = await UserController.uploadProfilePicture(session.user.id, upload);
        if (result.success && result.data) {
            setUser((prev) => {
                if (!prev) {
                    return prev;
                }
                return { ...prev, profilePicture: result.data };
            });
        }

        return result;
    };

    const removeProfilePicture = async (): Promise<AuthResponse> => {
        if (!session?.user?.id) {
            return { success: false, error: "No active session." };
        }

        const result = await UserController.removeProfilePicture(session.user.id);
        if (result.success) {
            setUser((prev) => {
                if (!prev) {
                    return prev;
                }
                return { ...prev, profilePicture: null };
            });
        }

        return result;
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                isLoading,
                refreshUser,
                login,
                register,
                logout,
                resetPassword,
                updateProfilePicture,
                removeProfilePicture,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Hook

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
