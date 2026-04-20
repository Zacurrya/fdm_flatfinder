import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockAuditLog } from "@mocks/data/audit.json";
import { getHistory, logAudit } from "@services/audit/auditService";
import { mockAuthSession, mockDatabaseCall, resetSupabaseMock } from "../helpers/supabaseMock";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("auditService", () => {
  describe("logAudit", () => {
    test("successfully logs an audit", async () => {
      mockAuthSession();
      const mockChain = mockDatabaseCall({ data: null, error: null });

      const result = await logAudit("SIGN_UP_REQUESTED", "target-123");

      expect(supabase.from).toHaveBeenCalledWith("AuditLogs");
      expect(mockChain.insert).toHaveBeenCalledWith({
        actionType: "SIGN_UP_REQUESTED",
        userId: "user-123",
        targetId: "target-123",
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("fails if no user session", async () => {
      (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null }, error: null });

      const result = await logAudit("SIGN_UP_REQUESTED", "target-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("No authenticated user.");
    });
  });

  describe("getHistory", () => {
    test("fetches and enriches audit history", async () => {
      const auditChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [mockAuditLog], error: null }),
      };

      const usersChain = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [{ userId: "user-123", email: "test@fdmgroup.com" }],
          error: null
        }),
      };

      (supabase.from as any).mockImplementation((table: string) => {
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
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "AuditLogs") return auditChain;
        return {};
      });

      const result = await getHistory();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });
});
