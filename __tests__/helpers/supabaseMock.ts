import { jest } from "@jest/globals";
import { supabase } from "@lib/supabase";

export const resetSupabaseMock = () => {
  jest.resetAllMocks();
};

export const createChainableSupabaseMock = (resolvedValue: any = { data: null, error: null }) => {
  const mockMethods = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolvedValue),
    maybeSingle: jest.fn().mockResolvedValue(resolvedValue),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    then: jest.fn((callback) => Promise.resolve(resolvedValue).then(callback))
  };
  return mockMethods;
};

// LOGIN MOCKS 

export const mockSuccessfulLogin = () => {
  const mockSession = { access_token: "token123" };
  const mockUserId = "37cc2c00-455e-4775-86e2-111f5df489db";

  (supabase.auth.signInWithPassword as any).mockResolvedValue({
    data: {
      session: mockSession,
      user: {
        id: mockUserId,
        email: "test@fdmgroup.com",
      },
    },
    error: null,
  });

  const single: any = jest.fn();
  single.mockResolvedValue({
    data: {
      userId: mockUserId,
      firstName: "Test",
      lastName: "User",
      profilePicture: null,
      phoneNumber: "+441234567890",
      officeLocation: "Singapore",
      role: "CONSULTANT",
      approvalStatus: "APPROVED",
      created_at: "2026-04-20T00:00:00.000Z",
    },
    error: null,
  });

  const eq = jest.fn().mockReturnValue({ single });
  const select = jest.fn().mockReturnValue({ eq });
  (supabase.from as any).mockReturnValue({ select });

  return { mockSession, mockUserId, select, eq, single };
};

export const mockFailedLogin = () => {
  (supabase.auth.signInWithPassword as any).mockResolvedValue({
    data: { session: null, user: null },
    error: { message: "Invalid login credentials" },
  });
};

// GENERIC DATABASE CALL MOCK
export const mockDatabaseCall = (resolvedValue: any) => {
  const mockChain = createChainableSupabaseMock(resolvedValue);
  (supabase.from as any).mockReturnValue(mockChain);
  return mockChain;
};

export const mockAuthSession = (userId: string = "user-123", email: string = "test@fdmgroup.com") => {
  (supabase.auth.getSession as any).mockResolvedValue({
    data: {
      session: {
        user: { id: userId, email }
      }
    },
    error: null
  });
};