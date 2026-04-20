import { jest } from "@jest/globals";

export const supabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    resetPasswordForEmail: jest.fn(),
  },
  from: jest.fn(),
  storage: {
    from: jest.fn(),
  },
};