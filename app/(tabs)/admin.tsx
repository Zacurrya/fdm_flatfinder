import AdminRequestsTable from "@components/admin/AdminRequestsTable";
import AdminTabs from "@components/admin/AdminTabs";
import AuditTable from "@components/admin/AuditTable";
import AwaitingApprovalView from "@components/ui/AwaitingApprovalView";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useAudit } from "@hooks/useAudit";
import { useRequests } from "@hooks/useRequests";
import { RequestRecord, RequestStatus } from "@services/requests/types";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Alert, Text, View, useWindowDimensions } from "react-native";

export default function AdminScreen() {
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [activeTab, setActiveTab] = useState<"requests" | "audits">("requests");
  const [requestStatusFilter, setRequestStatusFilter] = useState<RequestStatus | "ALL">("ALL");

  // Requests Hook
  const { 
    requests, 
    loading: isLoadingRequests, 
    error: requestsError, 
    processingId: requestProcessingId,
    fetchRequests,
    reviewRequest
  } = useRequests();

  // Audit Hook
  const { auditLogs, loading: isLoadingAudits, error: auditError, fetchHistory: fetchAuditHistory } = useAudit();

  const [auditSearchEmail, setAuditSearchEmail] = useState("");
  const [hasLoadedAudits, setHasLoadedAudits] = useState(false);
  const isAuditLandscape = activeTab === "audits" && width > height;

  // Effects
  useEffect(() => {
    void fetchRequests(requestStatusFilter === "ALL" ? undefined : requestStatusFilter);
  }, [fetchRequests, requestStatusFilter]);

  const loadAuditsIfNeeded = useCallback(async () => {
    await fetchAuditHistory();
    setHasLoadedAudits(true);
  }, [fetchAuditHistory]);

  useEffect(() => {
    if (activeTab === "audits" && !hasLoadedAudits) {
      void loadAuditsIfNeeded();
    }
  }, [activeTab, hasLoadedAudits, loadAuditsIfNeeded]);

  const handleReviewRequest = useCallback(
    async (request: RequestRecord, decision: "APPROVED" | "REJECTED") => {
      const result = await reviewRequest(request.id, decision);

      if (!result.success) {
        Alert.alert("Error", result.error ?? "Failed to review request.");
        return;
      }

      // Refresh list
      void fetchRequests(requestStatusFilter === "ALL" ? undefined : requestStatusFilter);
    },
    [fetchRequests, requestStatusFilter, reviewRequest]
  );

  const handleApproveRequest = useCallback(
    (request: RequestRecord) => {
      void handleReviewRequest(request, "APPROVED");
    },
    [handleReviewRequest]
  );

  const handleRejectRequest = useCallback(
    (request: RequestRecord) => {
      void handleReviewRequest(request, "REJECTED");
    },
    [handleReviewRequest]
  );

  const handleChangeRequestFilter = useCallback(
    (filter: RequestStatus | "ALL") => {
      setRequestStatusFilter(filter);
    },
    []
  );

  const handleRefreshRequests = useCallback(() => {
    void fetchRequests(requestStatusFilter === "ALL" ? undefined : requestStatusFilter);
  }, [fetchRequests, requestStatusFilter]);

  const handleSearchAudits = () => {
    void fetchAuditHistory();
  };

  const handleShowAllAudits = () => {
    setAuditSearchEmail("");
    void fetchAuditHistory();
  };

  if (user?.approvalStatus === "PENDING" || user?.approvalStatus === "REJECTED") {
    return (
      <AwaitingApprovalView
        title={user.approvalStatus === "REJECTED" ? "Account Denied" : "Awaiting Admin Approval"}
        message={
          user.approvalStatus === "REJECTED"
            ? "Your account has been denied. Please contact an administrator for more information."
            : "Your account is awaiting admin approval."
        }
      />
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <View className="flex-1 bg-fdm-bg items-center justify-center p-6">
        <StatusBar style="light" hidden={width > height} />
        <Ionicons name="lock-closed-outline" size={48} color="#ffffff30" />
        <Text className="text-fdm-fg/50 text-base mt-4 text-center">
          You don&apos;t have permission to access this page.
        </Text>
      </View>
    );
  }

  const subtitle =
    activeTab === "requests"
      ? `${requests.length} ${requests.length === 1 ? "request" : "requests"}`
      : `${auditLogs.length} audit ${auditLogs.length === 1 ? "entry" : "entries"}`;

  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" hidden={width > height} />

      <BackgroundCircle top={0} right={0} size={256} color="#CCFF001A" opacity={0.5} />

      {!isAuditLandscape ? (
        <View className={`${isLandscape ? "pt-6" : "pt-16"} pb-4 px-6 z-10`}>
          <Text className="text-fdm-fg text-2xl tracking-tighter" style={{ fontFamily: "Michroma_400Regular" }}>
            Admin <Text className="text-fdm-accent">Panel</Text>
          </Text>
          <Text className="text-fdm-fg/50 text-sm mt-1">{subtitle}</Text>
        </View>
      ) : null}

      {!isAuditLandscape ? (
        <View className="px-6 pb-3 z-10">
          <AdminTabs activeTab={activeTab} onChangeTab={setActiveTab} />
        </View>
      ) : null}

      {activeTab === "requests" ? (
        <AdminRequestsTable
          requests={requests}
          isLoading={isLoadingRequests}
          errorMessage={requestsError}
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
          auditError={auditError}
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
