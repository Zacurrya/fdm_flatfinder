import { RequestStatus } from "@/types/enums";
import { AdminRequest } from "@/types/views";
import { RequestService } from "@services/requests/requestService";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./general/useAuth";
import { useRealtime } from "./general/useRealtime";

/**
 * useRequests
 * Hook to manage and fetch request records for both users and admins.
 */
export const useRequests = (options?: { enabled?: boolean }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchRequests = useCallback(async (statusFilter?: RequestStatus) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      let data: AdminRequest[];
      if (user.role === "ADMIN") {
        data = await RequestService.getAllRequests(statusFilter);
      } else {
        data = (await RequestService.getUserRequests(user.userId)) as AdminRequest[];
      }
      setRequests(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch requests");
      console.error("[useRequests] Failed to fetch requests:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Subscribe to realtime changes to the requests table
  useRealtime("requests", {
    enabled: options?.enabled !== false && !!user,
    onInsert: () => fetchRequests(),
    onUpdate: () => fetchRequests(),
    onDelete: () => fetchRequests(),
  });

  useEffect(() => {
    if (options?.enabled !== false) {
      void fetchRequests();
    }
  }, [fetchRequests, options?.enabled]);

  const handleDecision = async (requestId: number, decision: RequestStatus.APPROVED | RequestStatus.REJECTED) => {
    setIsProcessing(true);
    setProcessingId(requestId);
    setError(null);
    try {
      await RequestService.reviewRequest({ requestId, decision });
      console.log(`[useRequests] Request ${requestId} ${decision.toLowerCase()} successfully`);
    } catch (err: any) {
      console.error(`[useRequests] Failed to ${decision.toLowerCase()} request ${requestId}:`, err);
      setError(err.message || "Failed to process request");
      throw err;
    } finally {
      setIsProcessing(false);
      setProcessingId(null);
    }
  };

  const approveRequest = (requestId: number) => handleDecision(requestId, RequestStatus.APPROVED);
  const rejectRequest = (requestId: number) => handleDecision(requestId, RequestStatus.REJECTED);

  return {
    requests,
    isLoading,
    error,
    fetchRequests,
    isProcessing,
    processingId,
    approveRequest,
    rejectRequest,
  };
}
