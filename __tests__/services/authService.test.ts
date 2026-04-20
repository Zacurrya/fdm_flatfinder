import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockUser } from "@mocks/data/users.json";
import { approveUser, deleteUser, getUserProfile, login, logout, register, rejectUser, resetPassword } from "@services/auth/authService";
import { mockAuthSession, mockFailedLogin, mockSuccessfulLogin, resetSupabaseMock } from "../helpers/supabaseMock";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("authService", () => {
  describe("login", () => {
    test("returns success with session and user on valid credentials", async () => {
      const { mockSession, mockUserId, select, eq, single } = mockSuccessfulLogin();
      const result = await login("test@fdmgroup.com", "test123!");

      expect(supabase.from).toHaveBeenCalledWith("Users");
      expect(select).toHaveBeenCalledWith("*");
      expect(eq).toHaveBeenCalledWith("userId", mockUserId);
      expect(single).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.data?.session).toEqual(mockSession);
      expect(result.data?.user).toMatchObject({
        userId: mockUserId,
      });
    });

    test("returns error on invalid credentials", async () => {
      mockFailedLogin();
      const result = await login("wrong@fdmgroup.com", "WrongPass123!");

      expect(supabase.from).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
    });
  });

  describe("register", () => {
    test("registers user successfully", async () => {
      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const usersMock = { insert: jest.fn().mockResolvedValue({ error: null }) };
      const requestsMock = { insert: jest.fn().mockResolvedValue({ error: null }) };
      const auditMock = { insert: jest.fn().mockResolvedValue({ error: null }) };

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Users") return usersMock;
        if (table === "Requests") return requestsMock;
        if (table === "AuditLogs") return auditMock;
        return {};
      });

      const result = await register({
        email: "test@fdmgroup.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        phoneNumber: "+441234567890",
        officeLocation: "London"
      });

      expect(supabase.auth.signUp).toHaveBeenCalled();
      expect(usersMock.insert).toHaveBeenCalled();
      expect(requestsMock.insert).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe("logout", () => {
    test("calls sign out", async () => {
      (supabase.auth.signOut as any).mockResolvedValue({ error: null });
      const result = await logout();
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe("resetPassword", () => {
    test("calls resetPasswordForEmail", async () => {
      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: null });
      const result = await resetPassword({ email: "test@fdmgroup.com" });
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("test@fdmgroup.com");
      expect(result.success).toBe(true);
    });
  });

  describe("approveUser", () => {
    test("updates approvalStatus to APPROVED", async () => {
      mockAuthSession();
      const usersMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      const auditMock = { insert: jest.fn().mockResolvedValue({ error: null }) };

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Users") return usersMock;
        if (table === "AuditLogs") return auditMock;
        return {};
      });

      const result = await approveUser({ userId: "user-123" });
      expect(usersMock.update).toHaveBeenCalledWith({ approvalStatus: "APPROVED" });
      expect(auditMock.insert).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe("rejectUser", () => {
    test("updates approvalStatus to REJECTED", async () => {
      mockAuthSession();
      const usersMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      const auditMock = { insert: jest.fn().mockResolvedValue({ error: null }) };

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Users") return usersMock;
        if (table === "AuditLogs") return auditMock;
        return {};
      });

      const result = await rejectUser({ userId: "user-123" });
      expect(usersMock.update).toHaveBeenCalledWith({ approvalStatus: "REJECTED" });
      expect(auditMock.insert).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe("deleteUser", () => {
    test("deletes user from DB", async () => {
      const usersMock = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      (supabase.from as any).mockReturnValue(usersMock);

      const result = await deleteUser({ userId: "user-123" });
      expect(usersMock.delete).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe("getUserProfile", () => {
    test("fetches user profile", async () => {
      mockAuthSession();
      const usersMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
      };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Users") return usersMock;
        return {};
      });

      const result = await getUserProfile("user-123");
      expect(result.success).toBe(true);
      expect(result.data?.userId).toBe("user-123");
    });
  });
});