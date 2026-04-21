import AdminRequestsTable from "@components/admin/AdminRequestsTable";
import AdminTabs from "@components/admin/AdminTabs";
import AuditTable from "@components/admin/AuditTable";
import AwaitingApprovalView from "@components/ui/AwaitingApprovalView";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as AuditController from "@services/audit/auditController";
import { AuditLog } from "@services/audit/types";
import * as RequestController from "@services/requests/requestController";
import { RequestRecord, RequestStatus } from "@services/requests/types";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Alert, Text, View, useWindowDimensions } from "react-native";

export default function AdminScreen() {
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [activeTab, setActiveTab] = useState<"requests" | "audits">("requests");
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState<RequestStatus | "ALL">("ALL");
  const [requestProcessingId, setRequestProcessingId] = useState<number | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingAudits, setIsLoadingAudits] = useState(false);
  const [auditSearchEmail, setAuditSearchEmail] = useState("");
  const [auditError, setAuditError] = useState("");
  const [hasLoadedAudits, setHasLoadedAudits] = useState(false);
  const isAuditLandscape = activeTab === "audits" && width > height;

  const fetchRequests = useCallback(async (filter?: RequestStatus) => {
    setIsLoadingRequests(true);
    setRequestsError("");

    const result = await RequestController.getAllRequests(filter);

    if (result.success && result.data) {
      setRequests(result.data);
    } else {
      setRequests([]);
      setRequestsError(result.error ?? "Unable to load requests.");
    }

    setIsLoadingRequests(false);
  }, []);

  const fetchAuditHistory = useCallback(async () => {
    setIsLoadingAudits(true);
    setAuditError("");

    const result = await AuditController.getHistory();

    if (result.success && result.data) {
      setAuditLogs(result.data);
    } else {
      setAuditLogs([]);
      setAuditError(result.error ?? "Unable to load audit history.");
    }

    setHasLoadedAudits(true);
    setIsLoadingAudits(false);
  }, []);

  useEffect(() => {
    void fetchRequests(requestStatusFilter === "ALL" ? undefined : requestStatusFilter);
  }, [fetchRequests, requestStatusFilter]);

  useEffect(() => {
    if (activeTab === "audits" && !hasLoadedAudits) {
      void fetchAuditHistory();
    }
  }, [activeTab, hasLoadedAudits, fetchAuditHistory]);

  const handleReviewRequest = useCallback(
    async (request: RequestRecord, decision: "APPROVED" | "REJECTED") => {
      setRequestProcessingId(request.id);

      const result = await RequestController.reviewRequest({
        requestId: request.id,
        decision,
      });

      setRequestProcessingId(null);

      if (!result.success) {
        Alert.alert("Error", result.error ?? "Failed to review request.");
        return;
      }

      await fetchRequests(requestStatusFilter === "ALL" ? undefined : requestStatusFilter);

      if (activeTab === "audits") {
        await fetchAuditHistory();
      }
    },
    [activeTab, fetchAuditHistory, fetchRequests, requestStatusFilter]
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
          onRefresh={fetchAuditHistory}
          showInlineTabs={isAuditLandscape}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />
      )}
    </View>
  );
}
