import * as RequestController from "@services/requests/requestController";
import { RequestRecord, RequestStatus } from "@services/requests/types";
import { useRealtime } from "@hooks/useRealtime";
import { logger } from "@utils/logger";
import { useCallback, useState } from "react";

/**
 * useRequests Hook
 * Manages the fetch/filter lifecycle and review orchestration for user requests.
 *
 * @returns Request list state, loading/error flags, and fetch/review helpers.
 */
export function useRequests({ enabled = true }: { enabled?: boolean } = {}) {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [currentStatus, setCurrentStatus] = useState<RequestStatus | undefined>(undefined);

  const fetchRequests = useCallback(async (status?: RequestStatus) => {
    setCurrentStatus(status);
    setLoading(true);
    setError(null);
    try {
      const result = await RequestController.getAllRequests(status);
      if (result.success && result.data) {
        setRequests(result.data);
      } else {
        setRequests([]);
        setError(result.error ?? "Failed to load requests.");
      }
    } catch {
      setError("An unexpected error occurred while fetching requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Reviews a request with the given decision
  const reviewRequest = useCallback(async (requestId: number, decision: "APPROVED" | "REJECTED") => {
    setProcessingId(requestId);
    setError(null);
    try {
      const result = await RequestController.reviewRequest({
        requestId,
        decision,
      });

      if (!result.success) {
        throw new Error(result.error ?? "Failed to review request.");
      }

      return result;
    } catch (err) {
      const msg = (err as Error)?.message ?? "An unexpected error occurred.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setProcessingId(null);
      logger.log(`Request complete. Decision: ${decision}`);
    }
  }, []);

  useRealtime<RequestRecord>("Requests", {
    onInsert: () => {
      void fetchRequests(currentStatus);
    },
    onUpdate: () => {
      void fetchRequests(currentStatus);
    },
    enabled,
  });

  return {
    requests,
    loading,
    error,
    processingId,
    fetchRequests,
    reviewRequest,
    setRequests, 
  };
}
