import { ActionType, ApprovalStatus, RequestType, Role } from '@/types/enums';
import { UserRecord } from '@/types/records';
import { supabase } from '@lib/supabase';
import { AuditService } from '@services/audit/auditService';
import { RequestService } from '@services/requests/requestService';
import { UserService } from '@services/user/userService';
import { Session } from '@supabase/supabase-js';
import { getInitials } from '@utils/formatters';
import { loginDTO, registerDTO } from './types';

export const AuthService = {


    /**
     * Authenticates a user with email and password.
     * Returns a user record and session so it can be stored in the auth context.
     */
    async login(dto: loginDTO): Promise<{ user: UserRecord; session: Session }> {
        const { data, error } = await supabase.auth.signInWithPassword(dto);
        if (error) throw error;

        const user = await UserService.getUserRecord(data.user.id);
        return { user, session: data.session };
    },

    /**
     * Logs out the current user.
     */
    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /**
     * Registers a new consultant user pending admin approval.
     */
    async register(dto: registerDTO): Promise<void> {
        const { data: auth, error } = await supabase.auth.signUp({
            email: dto.email,
            password: dto.password,
        });
        if (error || !auth.user) throw new Error(error?.message ?? 'Registration failed.');

        // Pre-generate the initials-based fallback avatar URL
        const initials = getInitials(dto.firstName, dto.lastName);
        const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=128&background=ccff00&color=1b1b1b&bold=true&format=png`;

        // Inserts the created user into the user table with a default avatar
        const { error: profileError } = await supabase.from('users').insert({
            user_id: auth.user.id,
            email: dto.email,
            first_name: dto.firstName,
            last_name: dto.lastName,
            office_location: dto.officeLocation,
            phone_number: dto.phoneNumber,
            role: Role.CONSULTANT,
            approval_status: ApprovalStatus.PENDING,
            avatar_url: fallbackAvatarUrl,
        });

        if (profileError) {
            await supabase.auth.admin.deleteUser(auth.user.id); // Couldn't create in the users table so remove from auth
            throw profileError;
        }

        try {
            await RequestService.createRequest({
                userId: auth.user.id,
                requestType: RequestType.SIGN_UP,
            });
        } catch (err) {
            // Cleanup profile if request fails
            await supabase.from('users').delete().eq('user_id', auth.user.id);
            await supabase.auth.admin.deleteUser(auth.user.id);
            throw err;
        }

        // Logs the new registration
        await AuditService.logAction({
            actionType: ActionType.SIGN_UP_REQUESTED,
            targetId: auth.user.id,
            userId: auth.user.id,
        });

        // Authenticates the user so that they can route to the main app
        await this.login({ email: dto.email, password: dto.password });
    },

    /**
     * Sends a password reset email.
     */
    async resetPassword(email: string): Promise<void> {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
    },

    /**
     * Checks if an email already exists in the system.
     */
    async emailExists(email: string): Promise<boolean> {
        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('email', email);
        if (error) throw error;
        return (count ?? 0) > 0;
    },

    /**
     * Checks if a phone number already exists in the system.
     */
    async phoneNumberExists(phoneNumber: string): Promise<boolean> {
        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('phone_number', phoneNumber);
        if (error) throw error;
        return (count ?? 0) > 0;
    },

    /**
     * Returns the current user's profile and session if they exist.
     */
    async getSession(): Promise<{ userProfile: UserRecord; session: Session } | null> {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            // If the refresh token is invalid or not found, we must sign out to clear storage
            const msg = error.message.toLowerCase();
            if (msg.includes('refresh token') || msg.includes('invalid_grant')) {
                await supabase.auth.signOut();
            }
            return null;
        }

        if (!session) return null;

        const userProfile = await UserService.getUserRecord(session.user.id);
        return { userProfile, session };
    },

    /**
     * Subscribes to auth state changes and automatically fetches the user profile.
     */
    onAuthStateChange(
        callback: (user: UserRecord | null, session: Session | null) => void
    ): { unsubscribe(): void } {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!session) return callback(null, null);
            try {
                const profile = await UserService.getUserRecord(session.user.id);
                callback(profile, session);
            } catch {
                callback(null, session);
            }
        });

        return subscription;
    },
};