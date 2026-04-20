import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockAuditLog } from "@mocks/data/audit.json";
import { mockAuditLogDTO } from "@mocks/data/dtos/auditLogDTO.json";
import { getHistory, logAudit } from "@services/audit/auditService";
import type { ActionType } from "@services/audit/auditTypes";
import { asAsyncMock, createResolvedMock, mockAuthSession, mockDatabaseCall, resetSupabaseMock } from "../helpers/supabaseMock";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("auditService", () => {
  describe("logAudit", () => {
    test("successfully logs an audit", async () => {
      mockAuthSession();
      const mockChain = mockDatabaseCall({ data: null, error: null });
      const typedAuditLogDTO = {
        ...mockAuditLogDTO,
        actionType: mockAuditLogDTO.actionType as ActionType,
      };

      const result = await logAudit(typedAuditLogDTO.actionType, typedAuditLogDTO.targetId);

      expect(supabase.from).toHaveBeenCalledWith("AuditLogs");
      expect(mockChain.insert).toHaveBeenCalledWith({
        actionType: "SIGN_UP_REQUESTED",
        userId: "user-123",
        targetId: typedAuditLogDTO.targetId,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("fails if no user session", async () => {
      asAsyncMock<{ data: { session: null }; error: null }>(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });
      const typedAuditLogDTO = {
        ...mockAuditLogDTO,
        actionType: mockAuditLogDTO.actionType as ActionType,
      };

      const result = await logAudit(typedAuditLogDTO.actionType, typedAuditLogDTO.targetId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No authenticated user.");
    });
  });

  describe("getHistory", () => {
    test("fetches and enriches audit history", async () => {
      const auditChain = {
        select: jest.fn().mockReturnThis(),
        order: createResolvedMock({ data: [mockAuditLog], error: null }),
      };

      const usersChain = {
        select: jest.fn().mockReturnThis(),
        in: createResolvedMock({
          data: [{ userId: "user-123", email: "test@fdmgroup.com" }],
          error: null
        }),
      };

      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "AuditLogs") return auditChain;
        if (table === "Users") return usersChain;
        return {};
      });

      const result = await getHistory();

      expect(supabase.from).toHaveBeenCalledWith("AuditLogs");
      expect(supabase.from).toHaveBeenCalledWith("Users");
      expect(result.success).toBe(true);
      expect(result.data?.[0].userEmail).toBe("test@fdmgroup.com");
      expect(result.data?.[0].targetEmail).toBe("test@fdmgroup.com");
    });

    test("returns empty array when no rows found", async () => {
      const auditChain = {
        select: jest.fn().mockReturnThis(),
        order: createResolvedMock({ data: [], error: null }),
      };

      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "AuditLogs") return auditChain;
        return {};
      });

      const result = await getHistory();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });
});
