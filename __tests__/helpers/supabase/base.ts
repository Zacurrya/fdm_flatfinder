import { jest } from "@jest/globals";
import { supabase } from "@lib/supabase";

// This file contains the base mocking engine for Supabase
// Provides fundamental logic for creating chainable, thenable mocks that mimic Supabase

export type AsyncMockFn<T> = (...args: unknown[]) => Promise<T>;

// 
export const createResolvedMock = <T>(resolvedValue: T): jest.MockedFunction<AsyncMockFn<T>> => {
  const mock = jest.fn(async () => resolvedValue) as jest.MockedFunction<AsyncMockFn<T>>;
  return mock;
};

// Casts a function to an async mock function
export const asAsyncMock = <T>(fn: unknown): jest.MockedFunction<AsyncMockFn<T>> => {
  return fn as jest.MockedFunction<AsyncMockFn<T>>;
};

// Mocks the .then() method of the SQL query builder
export const createThenCallbackMock = <T>(resolvedValue: T) => {
  return jest.fn((callback: (value: T) => unknown) => Promise.resolve(resolvedValue).then(callback));
};

export const resetSupabaseMock = () => {
  jest.clearAllMocks();
};

// Mocks the SQL query builder
export const createChainableSupabaseMock = (resolvedValue: unknown = { data: null, error: null }) => {
  const mockMethods = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
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

// Mocks the from() method of Supabase
export const mockDatabaseCall = (resolvedValue: unknown = { data: null, error: null }) => {
  const mockChain = createChainableSupabaseMock(resolvedValue);
  (supabase.from as jest.Mock).mockReturnValue(mockChain);
  return mockChain;
};
