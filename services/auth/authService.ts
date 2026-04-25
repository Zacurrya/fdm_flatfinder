import { ActionType, ApprovalStatus, RequestStatus, RequestType, Role } from '@/types/enums';
import { UserRecord } from '@/types/records';
import { supabase } from '@lib/supabase';
import { AuditService } from '@services/audit/auditService';
import { LocationService } from '@services/locations/locationService';
import { getInitials } from '@utils/formatters';
import {
    loginDTO,
    registerDTO,
} from './types';

export const AuthService = {
    /**
     * Authenticates a user with email and password.
     * Returns the whole user record and session so it can be stored in the auth context.
     */
    async login(dto: loginDTO): Promise<{ user: UserRecord; session: any }> {
        // Signs in using Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword(dto);
        if (authError) throw authError;

        // Gets the user profile from the users table
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', authData.user.id)
            .single();

        if (userError || !user) throw new Error(userError?.message ?? 'User profile not found.');

        console.log(`Login successful`)

        return {
            user: {
                userId: user.user_id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                officeLocation: await LocationService.resolveOfficeCityName(user.office_location),
                phoneNumber: user.phone_number,
                avatarUrl: user.avatar_url ?? null,
                role: user.role as Role,
                approvalStatus: user.approval_status as ApprovalStatus,
                createdAt: user.created_at,
            },
            session: authData.session,
        };
    },

    /**
     * Logs out the current user.
     */
    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        console.log('Logout successful');
    },

    /**
     * Registers a new consultant user pending admin approval.
     */
    async register(dto: registerDTO) {
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

        if (profileError) throw profileError;

        const { error: requestError } = await supabase.from('requests').insert({
            user_id: auth.user.id,
            request_type: RequestType.SIGN_UP,
            status: RequestStatus.PENDING,
        });

        if (requestError) throw requestError;

        // Logs the new registration
        await AuditService.logAction({
            actionType: ActionType.SIGN_UP_REQUESTED,
            targetId: auth.user.id,
            userId: auth.user.id,
        });

        console.log('User registered and approval request created');
    },

    /**
     * Sends a password reset email.
     */
    async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        console.log('Password reset email sent');
    },

    /**
     * Checks if an email already exists in the system.
     */
    async emailExists(email: string): Promise<boolean> {
        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('email', email);

        if (error) {
            console.log('Error checking if email exists:', error);
            throw new Error('Could not verify email uniqueness.');
        }

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

        if (error) {
            console.log('Error checking if phone number exists:', error);
            throw new Error('Could not verify phone number uniqueness.');
        }

        return (count ?? 0) > 0;
    },

    /**
     * Returns the current user's profile and session if they exist.
     * Otherwise, returns null.
     */
    async getSession(): Promise<{ userProfile: UserRecord; session: any } | null> {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session) throw sessionError;

        // Fetches the current user's profile from the user table
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

        if (userError || !user) throw new Error(userError?.message ?? 'User profile not found.');
        const officeLocation = await LocationService.resolveOfficeCityName(user.office_location);
        return {
            userProfile: {
                userId: user.user_id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                officeLocation,
                phoneNumber: user.phone_number,
                avatarUrl: user.avatar_url ?? null,
                role: user.role as Role,
                approvalStatus: user.approval_status as ApprovalStatus,
                createdAt: user.created_at,
            },
            session
        };
    },
};