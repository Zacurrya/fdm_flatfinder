import { useRealtime } from "@hooks/useRealtime";
import * as AuditController from "@services/audit/auditController";
import { ActionType, AuditLog } from "@services/audit/types";
import { useCallback, useEffect, useState } from "react";

/**
 * useAudit Hook
 * Subscribes to real-time audit log updates and manages local history.
 */
export function useAudit() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitialHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await AuditController.getHistory();
      if (result.success && result.data) {
        setAuditLogs(result.data);
      } else {
        setAuditLogs([]);
        setError(result.error ?? "Failed to fetch initial audit history.");
      }
    } catch (err) {
      setError("An unexpected error occurred during initial fetch.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onNewLog = useCallback((payload: any) => {
    const mappedLog: AuditLog = {
      auditId: payload.id,
      userId: payload.userId || "",
      targetId: payload.targetId || "",
      actionType: payload.actionType as ActionType,
      timeStamp: payload.timestamp || new Date().toISOString(),
    };
    setAuditLogs((prev) => [mappedLog, ...prev]);
  }, []);

  // Subscribe to real-time updates
  useRealtime<any>("AuditLogs", undefined, onNewLog);


  useEffect(() => {
    void loadInitialHistory();
  }, [loadInitialHistory]);

  const logAction = useCallback(async (action: ActionType, targetId: string) => {
    const result = await AuditController.logAudit(action, targetId);
    if (!result.success) {
      console.warn(`[useAudit] logAction failed:`, result.error);
    }
    return result;
  }, []);

  return {
    auditLogs,
    loading,
    error,
    logAction,
    fetchHistory: loadInitialHistory,
  };
}
