import { supabase } from "../api.client";

/**
 * Validates login credentials against the Users table.
 * Returns user data on success, or a descriptive error string on failure.
 */
export const login = async (email: string, password: string) => {
    const { data, error } = await supabase
        .from('Users')
        .select('email, password, Role')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

    if (error) {
        return { success: false, error: error.message };
    }

    if (!data) {
        return { success: false, error: "Invalid email or password." };
    }

    return { success: true, data };
}
