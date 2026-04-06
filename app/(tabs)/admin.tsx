import AuditHistoryTable from "@/components/admin/AuditHistoryTable";
import AdminTabs from "@components/admin/AdminTabs";
import AdminValidationRequests from "@components/admin/AdminValidationRequests";
import AwaitingApprovalView from "@components/ui/AwaitingApprovalView";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as AuditController from "@services/audit/auditController";
import { User } from "@services/auth/auth.types";
import * as AuthController from "@services/auth/authController";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import useAdminUserDecision from "../../components/admin/useAdminUserDecision";
import { AuditLog } from "../../services/audit/auditTypes";

export default function AdminScreen() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"requests" | "audits">("requests");
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingAudits, setIsLoadingAudits] = useState(false);
  const [auditSearchEmail, setAuditSearchEmail] = useState("");
  const [auditError, setAuditError] = useState("");
  const [hasLoadedAudits, setHasLoadedAudits] = useState(false);

  const fetchPendingUsers = useCallback(async () => {
    const result = await AuthController.getPendingUsers();
    if (result.success && result.data) {
      setPendingUsers(result.data);
    }
  }, []);

  const fetchAuditHistory = useCallback(async (email?: string) => {
    setIsLoadingAudits(true);
    setAuditError("");

    const result = await AuditController.getHistory(email);

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
    fetchPendingUsers().finally(() => setIsLoadingRequests(false));
  }, [fetchPendingUsers]);

  useEffect(() => {
    if (activeTab === "audits" && !hasLoadedAudits) {
      void fetchAuditHistory();
    }
  }, [activeTab, hasLoadedAudits, fetchAuditHistory]);

  const handleDecisionSuccess = useCallback(
    (pendingUser: User) => {
      setPendingUsers((prev) => prev.filter((u) => u.userId !== pendingUser.userId));
      if (activeTab === "audits") {
        void fetchAuditHistory(auditSearchEmail.trim() || undefined);
      }
    },
    [activeTab, fetchAuditHistory, auditSearchEmail]
  );

  const {
    processingId,
    approveUser: handleApprove,
    rejectUser: handleReject,
  } = useAdminUserDecision({
    onSuccess: handleDecisionSuccess,
  });

  const handleSearchAudits = () => {
    void fetchAuditHistory(auditSearchEmail.trim() || undefined);
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
        <StatusBar style="light" />
        <Ionicons name="lock-closed-outline" size={48} color="#ffffff30" />
        <Text className="text-fdm-fg/50 text-base mt-4 text-center">
          You don&apos;t have permission to access this page.
        </Text>
      </View>
    );
  }

  const subtitle =
    activeTab === "requests"
      ? `${pendingUsers.length} pending ${pendingUsers.length === 1 ? "request" : "requests"}`
      : `${auditLogs.length} audit ${auditLogs.length === 1 ? "entry" : "entries"}`;

  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" />

      <View className="absolute top-0 right-0 w-64 h-64 bg-fdm-accent/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <View className="pt-16 pb-4 px-6 z-10">
        <Text className="text-fdm-fg text-2xl tracking-tighter" style={{ fontFamily: "Michroma_400Regular" }}>
          Admin <Text className="text-fdm-accent">Panel</Text>
        </Text>
        <Text className="text-fdm-fg/50 text-sm mt-1">{subtitle}</Text>
      </View>

      <View className="px-6 pb-3 z-10">
        <AdminTabs activeTab={activeTab} onChangeTab={setActiveTab} />
      </View>

      {activeTab === "requests" ? (
        <AdminValidationRequests
          isLoading={isLoadingRequests}
          pendingUsers={pendingUsers}
          processingId={processingId}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ) : (
        <AuditHistoryTable
          auditLogs={auditLogs}
          isLoading={isLoadingAudits}
          auditError={auditError}
          auditSearchEmail={auditSearchEmail}
          onChangeSearchEmail={setAuditSearchEmail}
          onSearch={handleSearchAudits}
          onShowAll={handleShowAllAudits}
        />
      )}
    </View>
  );
}
