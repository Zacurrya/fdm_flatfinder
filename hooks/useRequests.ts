import { RequestStatus } from "@/types/enums";
import { AdminRequest } from "@/types/views";
import { RequestService } from "@services/requests/requestService";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

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
      return { success: true };
    } catch (err: any) {
      setError(err.message || "Failed to process request");
      return { success: false, error: err.message };
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
