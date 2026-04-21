import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockAuditLogDTO } from "@mocks/data/dtos/auditLogDTO.json";
import { mockAuditLog } from "@mocks/data/entities/audit.json";
import { mockUser } from "@mocks/data/entities/users.json";
import { getHistory, logAudit } from "@services/audit/auditService";
import type { ActionType } from "@services/audit/types";
import { asAsyncMock, mockAuditLogsTable, mockAuthSession, mockDatabaseCall, mockUsersTable, resetSupabaseMock } from "../helpers/supabase";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("auditService", () => {
  describe("logAudit", () => {
    test("successfully logs an audit", async () => {
      mockAuthSession();
      const mockChain = mockDatabaseCall({ data: mockAuditLog, error: null });
      const typedAuditLogDTO = {
        ...mockAuditLogDTO,
        actionType: mockAuditLogDTO.actionType as ActionType,
      };

      const result = await logAudit(typedAuditLogDTO.actionType, typedAuditLogDTO.targetId);

      expect(supabase.from).toHaveBeenCalledWith("AuditLogs");
      expect(mockChain.insert).toHaveBeenCalledWith({
        actionType: "SIGN_UP_REQUESTED",
        userId: mockUser.userId,
        targetId: typedAuditLogDTO.targetId,
      });
      expect(result.success).toBe(true);
      expect(result.data?.auditId).toBe(mockAuditLog.id);
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
      const auditChain = mockAuditLogsTable([mockAuditLog]);
      const usersChain = mockUsersTable([mockUser]);

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
      expect(result.data?.[0].userEmail).toBe(mockUser.email);
      expect(result.data?.[0].targetEmail).toBe(mockUser.email);
    });

    test("returns empty array when no rows found", async () => {
      const auditChain = mockAuditLogsTable([]);

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
