import { AuthContext } from "@context/AuthContext";
import { useContext } from "react";

/**
 * 
 * @returns User's auth session, profile, and related functions from the AuthContext.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
