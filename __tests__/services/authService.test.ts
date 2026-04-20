import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockApprovalDTO } from "@mocks/data/dtos/approvalDTO.json";
import { mockLoginDTO } from "@mocks/data/dtos/loginDTO.json";
import { mockPasswordResetDTO } from "@mocks/data/dtos/passwordResetDTO.json";
import { mockRegistrationDTO } from "@mocks/data/dtos/registrationDTO.json";
import { approveUser, login, logout, register, rejectUser, resetPassword } from "@services/auth/authService";
import { asAsyncMock, createResolvedMock, mockAuthSession, mockFailedLogin, mockSuccessfulLogin, resetSupabaseMock } from "../helpers/supabaseMock";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("authService", () => {
  describe("login", () => {
    test("returns success with session and user on valid credentials", async () => {
      const { mockSession, mockUserId, select, eq, single } = mockSuccessfulLogin();
      const result = await login(mockLoginDTO.email, mockLoginDTO.password);

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
      const invalidLoginDTO = {
        ...mockLoginDTO,
        email: "wrong@fdmgroup.com",
        password: "WrongPass123!",
      };
      const result = await login(invalidLoginDTO.email, invalidLoginDTO.password);

      expect(supabase.from).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
    });
  });

  describe("register", () => {
    test("registers user successfully", async () => {
      asAsyncMock<{ data: { user: { id: string } }; error: null }>(supabase.auth.signUp).mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const usersMock = { insert: createResolvedMock({ error: null }) };
      const requestsMock = { insert: createResolvedMock({ error: null }) };
      const auditMock = { insert: createResolvedMock({ error: null }) };

      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Users") return usersMock;
        if (table === "Requests") return requestsMock;
        if (table === "AuditLogs") return auditMock;
        return {};
      });

      const result = await register(mockRegistrationDTO);

      expect(supabase.auth.signUp).toHaveBeenCalled();
      expect(usersMock.insert).toHaveBeenCalled();
      expect(requestsMock.insert).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe("logout", () => {
    test("calls sign out", async () => {
      asAsyncMock<{ error: null }>(supabase.auth.signOut).mockResolvedValue({ error: null });
      const result = await logout();
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe("resetPassword", () => {
    test("calls resetPasswordForEmail", async () => {
      asAsyncMock<{ error: null }>(supabase.auth.resetPasswordForEmail).mockResolvedValue({ error: null });
      const result = await resetPassword(mockPasswordResetDTO);
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("test@fdmgroup.com");
      expect(result.success).toBe(true);
    });
  });

  describe("approveUser", () => {
    test("updates approvalStatus to APPROVED", async () => {
      mockAuthSession();
      const usersMock = {
        update: jest.fn().mockReturnThis(),
        eq: createResolvedMock({ error: null }),
      };
      const auditMock = { insert: createResolvedMock({ error: null }) };

      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Users") return usersMock;
        if (table === "AuditLogs") return auditMock;
        return {};
      });

      const result = await approveUser(mockApprovalDTO);
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
        eq: createResolvedMock({ error: null }),
      };
      const auditMock = { insert: createResolvedMock({ error: null }) };

      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Users") return usersMock;
        if (table === "AuditLogs") return auditMock;
        return {};
      });

      const result = await rejectUser(mockApprovalDTO);
      expect(usersMock.update).toHaveBeenCalledWith({ approvalStatus: "REJECTED" });
      expect(auditMock.insert).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
