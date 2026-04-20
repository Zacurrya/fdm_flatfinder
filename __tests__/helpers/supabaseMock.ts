import { jest } from "@jest/globals";
import { supabase } from "@lib/supabase";

/*
// This file provides helper functions to create consistent mocks for Supabase interactions across tests, 
// as well as specific mocks for common scenarios like authentication and database calls. 
// It also includes a utility to reset all mocks before each test to ensure test isolation.
*/
type AsyncMockFn<T> = (...args: unknown[]) => Promise<T>;

export const createResolvedMock = <T>(resolvedValue: T): jest.MockedFunction<AsyncMockFn<T>> => {
  const mock = jest.fn(async () => resolvedValue) as jest.MockedFunction<AsyncMockFn<T>>;
  return mock;
};

export const asAsyncMock = <T>(fn: unknown): jest.MockedFunction<AsyncMockFn<T>> => {
  return fn as jest.MockedFunction<AsyncMockFn<T>>;
};

export const createThenCallbackMock = <T>(resolvedValue: T) => {
  return jest.fn((callback: (value: T) => unknown) => Promise.resolve(resolvedValue).then(callback));
};

export const resetSupabaseMock = () => {
  jest.clearAllMocks();
};

export const createChainableSupabaseMock = (resolvedValue: unknown = { data: null, error: null }) => {
  const mockMethods = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    single: createResolvedMock(resolvedValue),
    maybeSingle: createResolvedMock(resolvedValue),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    then: createThenCallbackMock(resolvedValue)
  };
  return mockMethods;
};

// LOGIN MOCKS

export const mockSuccessfulLogin = () => {
  const mockSession = { access_token: "token123" };
  const mockUserId = "37cc2c00-455e-4775-86e2-111f5df489db";

  asAsyncMock<{ data: { session: { access_token: string }; user: { id: string; email: string } }; error: null }>(
    supabase.auth.signInWithPassword
  ).mockResolvedValue({
    data: {
      session: mockSession,
      user: {
        id: mockUserId,
        email: "test@fdmgroup.com",
      },
    },
    error: null,
  });

  const single = createResolvedMock({
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
  (supabase.from as jest.Mock).mockReturnValue({ select });

  return { mockSession, mockUserId, select, eq, single };
};

export const mockFailedLogin = () => {
  asAsyncMock<{ data: { session: null; user: null }; error: { message: string } }>(
    supabase.auth.signInWithPassword
  ).mockResolvedValue({
    data: { session: null, user: null },
    error: { message: "Invalid login credentials" },
  });
};

// GENERIC DATABASE CALL MOCK
export const mockDatabaseCall = (resolvedValue: unknown) => {
  const mockChain = createChainableSupabaseMock(resolvedValue);
  (supabase.from as jest.Mock).mockReturnValue(mockChain);
  return mockChain;
};

export const mockAuthSession = (userId: string = "user-123", email: string = "test@fdmgroup.com") => {
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
