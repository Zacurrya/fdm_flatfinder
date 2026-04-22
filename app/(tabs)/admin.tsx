import AdminRequestsTable from "@components/admin/AdminRequestsTable";
import AdminTabs from "@components/admin/AdminTabs";
import AuditTable from "@components/admin/AuditTable";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import ScreenHeader from "@components/ui/ScreenHeader";
import { useAudit } from "@hooks/useAudit";
import { useRequests } from "@hooks/useRequests";
import { useFocusEffect } from "@react-navigation/native";
import { RequestRecord, RequestStatus } from "@services/requests/types";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { View, useWindowDimensions } from "react-native";

export default function AdminScreen() {
  const { width, height } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<"requests" | "audits">("requests");
  const [requestStatusFilter, setRequestStatusFilter] = useState<RequestStatus | "ALL">("ALL");

  const {
    requests,
    loading: isLoadingRequests,
    error: requestsError,
    processingId: requestProcessingId,
    fetchRequests,
    reviewRequest,
  } = useRequests({ enabled: activeTab === "requests" });

  const { auditLogs, loading: isLoadingAudits, error: auditError, fetchHistory: fetchAuditHistory } = useAudit();

  const [auditSearchEmail, setAuditSearchEmail] = useState("");
  const isAuditLandscape = activeTab === "audits" && width > height;

  // Initial requests load
  useFocusEffect(
    useCallback(() => {
      void fetchRequests(requestStatusFilter === "ALL" ? undefined : requestStatusFilter);
    }, [fetchRequests, requestStatusFilter])
  );

  // Refreshes requests after admin action
  const handleRefreshRequests = useCallback(() => {
    void fetchRequests(requestStatusFilter === "ALL" ? undefined : requestStatusFilter);
  }, [fetchRequests, requestStatusFilter]);

  const handleReviewRequest = useCallback(
    async (request: RequestRecord, decision: "APPROVED" | "REJECTED") => {
      const result = await reviewRequest(request.id, decision);
      if (result.success) void handleRefreshRequests();
    },
    [reviewRequest, handleRefreshRequests]
  );

  const handleApproveRequest = useCallback(
    (request: RequestRecord) => void handleReviewRequest(request, "APPROVED"),
    [handleReviewRequest]
  );

  const handleRejectRequest = useCallback(
    (request: RequestRecord) => void handleReviewRequest(request, "REJECTED"),
    [handleReviewRequest]
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

  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" hidden={width > height} />
      <BackgroundCircle top={0} right={0} size={256} color="#CCFF001A" opacity={0.5} />

      {!isAuditLandscape && (
        <ScreenHeader title="Admin" highlightedTitle="Panel" subtitle={subtitle} />
      )}

      {!isAuditLandscape && (
        <View className="px-6 pb-3 z-10">
          <AdminTabs activeTab={activeTab} onChangeTab={setActiveTab} />
        </View>
      )}

      {activeTab === "requests" ? (
        <AdminRequestsTable
          requests={requests}
          isLoading={isLoadingRequests}
          isRefreshing={isLoadingRequests}
          errorMessage={requestsError ?? ""}
          statusFilter={requestStatusFilter}
          processingId={requestProcessingId}
          onChangeFilter={handleChangeRequestFilter}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
          onRefresh={handleRefreshRequests}
        />
      ) : (
        <AuditTable
          auditLogs={auditLogs}
          isLoading={isLoadingAudits}
          auditError={auditError ?? ""}
          auditSearchEmail={auditSearchEmail}
          onChangeSearchEmail={setAuditSearchEmail}
          onSearch={handleSearchAudits}
          onShowAll={handleShowAllAudits}
          showInlineTabs={isAuditLandscape}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />
      )}
    </View>
  );
}