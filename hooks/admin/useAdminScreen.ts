import { RequestStatus } from "@/types/enums";
import { AdminRequest } from "@/types/views";
import { useAudit } from "@hooks/general/useAudit";
import { useRequests } from "@hooks/useRequests";
import { useFocusEffect } from "@react-navigation/native";
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback, useState } from "react";
import { useWindowDimensions } from "react-native";

/**
 * Handles:
 * - admin screen tab state
 * - orientation
 * - request filtering and actions
 */
export const useAdminScreen = () => {
  const { width, height } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<"requests" | "audits">("requests");
  const [requestStatusFilter, setRequestStatusFilter] = useState<RequestStatus | "ALL">("ALL");

  const {
    requests,
    isLoading: isLoadingRequests,
    error: requestsError,
    fetchRequests,
    approveRequest,
    rejectRequest,
    processingId: requestProcessingId,
  } = useRequests({ enabled: activeTab === "requests" });

  const { auditLogs, isLoading, fetchHistory: fetchAuditHistory } = useAudit();

  const [auditSearchEmail, setAuditSearchEmail] = useState("");
  const isAuditLandscape = activeTab === "audits" && width > height;

  // Initial requests load & Orientation control
  useFocusEffect(
    useCallback(() => {
      // Unlock orientation to allow landscape on this screen
      void ScreenOrientation.unlockAsync();

      void fetchRequests(requestStatusFilter === "ALL" ? undefined : requestStatusFilter);

      return () => {
        // Re-lock to portrait when leaving the screen
        void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      };
    }, [fetchRequests, requestStatusFilter])
  );

  // Refreshes requests after admin action
  const handleRefreshRequests = useCallback(() => {
    void fetchRequests(requestStatusFilter === "ALL" ? undefined : requestStatusFilter);
  }, [fetchRequests, requestStatusFilter]);

  const handleApproveRequest = useCallback(
    async (request: AdminRequest) => {
      try {
        await approveRequest(request.id);
        void handleRefreshRequests();
      } catch (e) {
        // Error is handled by useRequests state
      }
    },
    [approveRequest, handleRefreshRequests]
  );

  const handleRejectRequest = useCallback(
    async (request: AdminRequest) => {
      try {
        await rejectRequest(request.id);
        void handleRefreshRequests();
      } catch (e) {
        // Error is handled by useRequests state
      }
    },
    [rejectRequest, handleRefreshRequests]
  );

  const handleChangeRequestFilter = useCallback(
    (filter: RequestStatus | "ALL") => setRequestStatusFilter(filter),
    []
  );

  const handleSearchAudits = () => void fetchAuditHistory();
  const handleShowAllAudits = () => {
    setAuditSearchEmail("");
    void fetchAuditHistory();
  };

  const subtitle =
    activeTab === "requests"
      ? `${requests.length} ${requests.length === 1 ? "request" : "requests"}`
      : `${auditLogs.length} audit ${auditLogs.length === 1 ? "entry" : "entries"}`;

  return {
    width,
    height,
    activeTab,
    setActiveTab,
    requestStatusFilter,
    requests,
    isLoadingRequests,
    requestsError,
    requestProcessingId,
    auditLogs,
    isLoading,
    auditSearchEmail,
    setAuditSearchEmail,
    isAuditLandscape,
    subtitle,
    handleApproveRequest,
    handleRejectRequest,
    handleChangeRequestFilter,
    handleSearchAudits,
    handleShowAllAudits,
    handleRefreshRequests,
  };
};
