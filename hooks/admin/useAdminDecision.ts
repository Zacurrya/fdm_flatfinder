import { useState } from "react";
import { RequestService } from "@services/requests/requestService";
import { RequestStatus } from "@/types/enums";

/**
 * useAdminDecision
 * Hook to handle admin actions (approve/reject) on requests.
 */
export const useAdminDecision = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Handles the decision for a specific request.
     */
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
        isProcessing,
        processingId,
        error,
        approveRequest,
        rejectRequest
    };
};
