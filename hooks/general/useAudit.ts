import { ActionType } from "@/types/enums";
import { AuditLogRecord } from "@/types/records";
import { useAuth } from "@hooks/general/useAuth";
import { useRealtime } from "@hooks/general/useRealtime";
import { AuditService } from "@services/audit/auditService";
import { useCallback, useEffect, useState } from "react";

/**
 * Subscribes to real-time audit log updates and manages local history.
 */
export const useAudit = () => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadInitialHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await AuditService.getAudits();
      setAuditLogs(data);
    } catch (err) {
      console.error("[useAudit] Error loading audit history:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onNewLog = useCallback((payload: any) => {
    // Refetch to ensure enrichment of the new log
    loadInitialHistory();
  }, [loadInitialHistory]);

  // Subscribe to real-time updates for the audit_logs table only if user is approved
  useRealtime<any>("audit_logs", { onInsert: onNewLog, enabled: user?.approvalStatus === "APPROVED" });

  useEffect(() => {
    void loadInitialHistory();
  }, [loadInitialHistory]);

  const logAction = useCallback(async (action: ActionType, targetId: string) => {
    if (!user) return;
    try {
      await AuditService.logAction({
        userId: user.userId,
        targetId,
        actionType: action,
      });
    } catch (err) {
      console.error("[useAudit] logAction failed:", err);
    }
  }, [user]);

  return {
    auditLogs,
    isLoading,
    logAction,
    fetchHistory: loadInitialHistory,
  };
}
