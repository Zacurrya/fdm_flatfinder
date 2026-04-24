import { UserRecord } from "@/types/records";
import { supabase } from "@lib/supabase";
import { AuthService } from "@services/auth/authService";
import { loginDTO, registerDTO } from "@services/auth/types";
import { UserService } from "@services/user/userService";
import { Session } from "@supabase/supabase-js";
import { logger } from "@utils/logger";
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
            const { userProfile, session } = await AuthService.getSession();

            setUser(userProfile);
            setSession(session);
        } catch (err) {
            logger.log("No session found: ", err);
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
                    logger.log("Error updating user profile on auth change:", err);
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
            logger.log("Error refreshing user:", err);
        }
    };

    const login = async (dto: loginDTO) => {
        try {
            setIsLoading(true);
            const { user, session } = await AuthService.login(dto);
            setUser(user);
            setSession(session);
            logger.log("Login successful");
        } catch (err) {
            logger.log("Error logging in:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (dto: registerDTO) => {
        await AuthService.register(dto);
    };

    const logout = async () => {
        await AuthService.logout();
        setUser(null);
        setSession(null);
        logger.log("Logout successful");
    };

    const resetPassword = async (email: string) => {
        try {
            setIsLoading(true);
            await AuthService.resetPassword(email);
            logger.log("Password reset email sent");
        } catch (err) {
            logger.log("Error resetting password:", err);
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