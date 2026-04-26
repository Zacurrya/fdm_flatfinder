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
    refreshUser: () => Promise<void>;
    login: (dto: loginDTO) => Promise<void>;
    register: (dto: registerDTO) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    isLoading: boolean;
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
            } else {
                setUser(null);
                setSession(null);
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

        const subscription = AuthService.onAuthStateChange((newUser: UserRecord | null, newSession: Session | null) => {
            setUser(newUser);
            setSession(newSession);
        });

        return () => subscription.unsubscribe();
    }, [hydrateSession]);

    const refreshUser = useCallback(async () => {
        if (!session) return;
        try {
            const profile = await UserService.getUserRecord(session.user.id);
            setUser(profile);
        } catch (err) {
            console.error("Error refreshing user:", err);
        }
    }, [session]);

    // Realtime subscription to the user's personal record in the 'users' table.
    useEffect(() => {
        if (!session?.user?.id) return;

        const channel = supabase
            .channel(`user-profile-${session.user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "users",
                    filter: `user_id=eq.${session.user.id}`,
                },
                (payload) => {
                    console.log("[AuthContext] User record changed, patching state instantly...");

                    // Directly merge the incoming changes into the existing user state
                    setUser((prevUser) => {
                        if (!prevUser) return payload.new as UserRecord;
                        return { ...prevUser, ...(payload.new as Partial<UserRecord>) };
                    });
                }
            )
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [session?.user?.id]);

    const login = async (dto: loginDTO) => {
        try {
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
            await AuthService.register(dto);
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
            setUser(null);
            setSession(null);
        } catch (err) {
            console.error("Error logging out:", err);
        }
    };

    const resetPassword = async (email: string) => {
        try {
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
                refreshUser,
                login,
                register,
                logout,
                resetPassword,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
