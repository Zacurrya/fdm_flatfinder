import { supabase } from "@lib/supabase";
import {
    ApprovalDTO,
    AuthResponse,
    DeletionDTO,
    PasswordResetDTO,
    RegistrationDTO,
    User,
} from "@services/auth/auth.types";
import { Session } from "@supabase/supabase-js";

// ─── Register ────────────────────────────────────────────────────────────────

/**
 * Creates a Supabase auth account, then inserts a profile row into the Users
 * table with approvalStatus = 'PENDING' and role = 'CONSULTANT'.
 */
export const register = async (
    dto: RegistrationDTO
): Promise<AuthResponse> => {
    // 1. Create the Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dto.email,
        password: dto.password,
    });

    if (authError) {
        return { success: false, error: authError.message };
    }

    const authUserId = authData.user?.id;
    if (!authUserId) {
        return { success: false, error: "Registration failed. Please try again." };
    }

    // 2. Insert profile row into Users table
    const { error: insertError } = await supabase.from("Users").insert({
        userId: authUserId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        officeLocation: dto.officeLocation,
        role: "CONSULTANT",
        approvalStatus: "PENDING",
    });

    if (insertError) {
        // Rollback: clean up the auth user if profile insert fails.
        // Note: This requires admin privileges or a server-side function.
        // For now, sign out the partial user.
        console.error("Users insert failed:", insertError);
        await supabase.auth.signOut();
        return { success: false, error: `Failed to create user profile: ${insertError.message}` };
    }

    // Sign out after registration — user must wait for admin approval
    await supabase.auth.signOut();

    return { success: true };
};

// ─── Login ───────────────────────────────────────────────────────────────────

/**
 * Authenticates via Supabase, then checks the Users table for approval status.
 * Pending and rejected users are allowed to sign in so UI can reflect status.
 */
export const login = async (
    email: string,
    password: string
): Promise<AuthResponse<{ session: Session; user: User }>> => {
    // 1. Authenticate with Supabase
    const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
        return { success: false, error: authError.message };
    }

    if (!authData.session || !authData.user) {
        return { success: false, error: "Login failed. Please try again." };
    }

    // 2. Fetch user profile from the Users table
    console.log("Login: looking up userId =", authData.user.id);
    const { data: profile, error: profileError } = await supabase
        .from("Users")
        .select("*")
        .eq("userId", authData.user.id)
        .single();

    if (profileError || !profile) {
        console.error("Profile lookup failed:", { profileError, authUserId: authData.user.id });
        await supabase.auth.signOut();
        return { success: false, error: `Auth ID: ${authData.user.id}. Error: ${profileError?.message ?? "no row"}` };
    }

    // 3. Build the User entity
    const user: User = {
        userId: profile.userId,
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        email: authData.user.email ?? email,
        phoneNumber: profile.phoneNumber ?? "",
        officeLocation: profile.officeLocation ?? "",
        role: profile.role as User["role"],
        approvalStatus: profile.approvalStatus as User["approvalStatus"],
        createdAt: profile.created_at,
    };

    return {
        success: true,
        data: { session: authData.session, user },
    };
};

// ─── Logout ──────────────────────────────────────────────────────────────────

/**
 * Signs out the current Supabase session and clears persisted auth state.
 */
export const logout = async (): Promise<AuthResponse> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
};

// ─── Password Reset ──────────────────────────────────────────────────────────

/**
 * Sends a password reset email via Supabase Auth.
 */
export const resetPassword = async (
    dto: PasswordResetDTO
): Promise<AuthResponse> => {
    const { error } = await supabase.auth.resetPasswordForEmail(dto.email);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
};

// ─── Approve User (Admin) ────────────────────────────────────────────────────

/**
 * Updates a user's approvalStatus to 'APPROVED'.
 * Should only be called by ADMIN role users.
 */
export const approveUser = async (
    dto: ApprovalDTO
): Promise<AuthResponse> => {
    const { error } = await supabase
        .from("Users")
        .update({ approvalStatus: "APPROVED" })
        .eq("userId", dto.userId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
};

// ─── Reject User (Admin) ────────────────────────────────────────────────────

/**
 * Updates a user's approvalStatus to 'REJECTED'.
 * Should only be called by ADMIN role users.
 */
export const rejectUser = async (
    dto: ApprovalDTO
): Promise<AuthResponse> => {
    const { error } = await supabase
        .from("Users")
        .update({ approvalStatus: "REJECTED" })
        .eq("userId", dto.userId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
};

// ─── Delete User (Admin) ─────────────────────────────────────────────────────

/**
 * Deletes a user's profile from the Users table.
 * The CASCADE on auth_id FK will handle Supabase auth cleanup if configured.
 */
export const deleteUser = async (
    dto: DeletionDTO
): Promise<AuthResponse> => {
    const { error } = await supabase
        .from("Users")
        .delete()
        .eq("userId", dto.userId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
};

// ─── Get User Profile ────────────────────────────────────────────────────────

/**
 * Fetches a user's profile from the Users table by their auth UUID.
 */
export const getUserProfile = async (
    authUserId: string
): Promise<AuthResponse<User>> => {
    const { data: profile, error } = await supabase
        .from("Users")
        .select("*")
        .eq("userId", authUserId)
        .single();

    if (error || !profile) {
        return { success: false, error: "User profile not found." };
    }

    // We need the email from auth — get the current session
    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData?.session?.user?.email ?? "";

    const user: User = {
        userId: profile.userId,
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        email,
        phoneNumber: profile.phoneNumber ?? "",
        officeLocation: profile.officeLocation ?? "",
        role: profile.role as User["role"],
        approvalStatus: profile.approvalStatus as User["approvalStatus"],
        createdAt: profile.created_at,
    };

    return { success: true, data: user };
};

// ─── Get Pending Users (Admin) ───────────────────────────────────────────────

/**
 * Fetches all users with approvalStatus = 'PENDING'.
 * Used by the admin approval screen.
 */
export const getPendingUsers = async (): Promise<
    AuthResponse<User[]>
> => {
    const { data, error } = await supabase
        .from("Users")
        .select("*")
        .eq("approvalStatus", "PENDING")
        .order("created_at", { ascending: true });

    if (error) {
        return { success: false, error: error.message };
    }

    const users = (data ?? []).map((row) => ({
        userId: row.userId,
        firstName: row.firstName ?? "",
        lastName: row.lastName ?? "",
        email: row.email ?? "",
        phoneNumber: row.phoneNumber ?? "",
        officeLocation: row.officeLocation ?? "",
        role: row.role as User["role"],
        approvalStatus: row.approvalStatus as User["approvalStatus"],
        createdAt: row.created_at,
    }));

    return { success: true, data: users };
};
