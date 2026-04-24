import { AuthContext, AuthContextType } from "@context/AuthContext";
import { useContext } from "react";

export type { AuthContextType };

/**
 * Provides the current auth session, user profile, and auth actions.
 * Must be used within an <AuthProvider>.
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
