import { UserRecord } from "@/types/records";
import { supabase } from "@lib/supabase";
import { AuthService } from "@services/auth/authService";
import { loginDTO, registerDTO } from "@services/auth/types";
import { UserService } from "@services/user/userService";
import { Session } from "@supabase/supabase-js";
import { createContext, useCallback, useEffect, useState } from "react";

export type AuthContextType = {
    user: UserRecord | null;
    session: Session | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
    login: (dto: loginDTO) => Promise<void>;
    register: (dto: registerDTO) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserRecord | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const hydrateSession = useCallback(async () => {
        try {
            const result = await AuthService.getSession();
            if (result) {
                setUser(result.userProfile);
                setSession(result.session);
            }
        } catch (err) {
            console.log("No session found: ", err);
            setUser(null);
            setSession(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Hydrates session and subscribes to auth state changes.
    useEffect(() => {
        hydrateSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            setSession(newSession);
            if (newSession) {
                try {
                    const profile = await UserService.getUserProfile(newSession.user.id);
                    setUser(profile);
                } catch (err) {
                    console.log("Failed to hydrate session:", err);
                }
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [hydrateSession]);

    const refreshUser = async () => {
        if (!session) return;
        try {
            const profile = await UserService.getUserProfile(session.user.id);
            setUser(profile);
        } catch (err) {
            console.error("Error refreshing user:", err);
        }
    };

    const login = async (dto: loginDTO) => {
        try {
            setIsLoading(true);
            const { user, session } = await AuthService.login(dto);
            setUser(user);
            setSession(session);
            console.log("Login successful");
        } catch (err) {
            console.log("Login failed:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (dto: registerDTO) => {
        try {
            setIsLoading(true);
            await AuthService.register(dto);
            console.log("Registration successful");
        } catch (err) {
            console.error("Error registering:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await AuthService.logout();
            setIsLoading(true);
            setUser(null);
            setSession(null);
            console.log("Logout successful");
        } catch (err) {
            console.error("Error logging out:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        try {
            setIsLoading(true);
            await AuthService.resetPassword(email);
            console.log("Password reset email sent");
        } catch (err) {
            console.error("Error resetting password:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoading,
                refreshUser,
                login,
                register,
                logout,
                resetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};