import { supabase } from "@lib/supabase";
import { mockUser } from "@mocks/data/entities/users.json";
import { asAsyncMock, mockUsersTable } from "./user";

// Auth Mock Helpers

export const mockSuccessfulLogin = () => {
    const mockSession = { access_token: "token123" };
    const mockUserId = mockUser.userId;

    asAsyncMock<{ data: { session: { access_token: string }; user: { id: string; email: string } }; error: null }>(
        supabase.auth.signInWithPassword
    ).mockResolvedValue({
        data: {
            session: mockSession,
            user: {
                id: mockUserId,
                email: mockUser.email,
            },
        },
        error: null,
    });

    const usersMock = mockUsersTable(mockUser);
    (supabase.from as jest.Mock).mockReturnValue(usersMock);

    return { mockSession, mockUserId, ...usersMock };
};

export const mockFailedLogin = () => {
    asAsyncMock<{ data: { session: null; user: null }; error: { message: string } }>(
        supabase.auth.signInWithPassword
    ).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: "Invalid login credentials" },
    });
};

export const mockSuccessfulSignUp = (userId: string = mockUser.userId) => {
    asAsyncMock<{ data: { user: { id: string } }; error: null }>(supabase.auth.signUp).mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
    });
};

export const mockAuthSignOut = () => {
    asAsyncMock<{ error: null }>(supabase.auth.signOut).mockResolvedValue({ error: null });
};

export const mockAuthSession = (userId: string = mockUser.userId, email: string = mockUser.email) => {
    asAsyncMock<{ data: { session: { user: { id: string; email: string } } }; error: null }>(
        supabase.auth.getSession
    ).mockResolvedValue({
        data: {
            session: {
                user: { id: userId, email }
            }
        },
        error: null
    });
};
