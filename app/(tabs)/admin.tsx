import AdminTabs from "@components/admin/AdminTabs";
import AuditTable from "@components/admin/AuditTable";
import RequestsList from "@components/admin/RequestsList";
import ScreenHeader from "@components/ui/ScreenHeader";
import { useAdminScreen } from "@hooks/admin/useAdminScreen";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

const AdminScreen = () => {
  const {
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
    subtitle,
    handleApproveRequest,
    handleRejectRequest,
    handleChangeRequestFilter,
    handleSearchAudits,
    handleShowAllAudits,
    handleRefreshRequests,
  } = useAdminScreen();

  const isLandscape = width > height;

  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" hidden={isLandscape} />

      {!isLandscape && (
        <ScreenHeader title="Admin" />
      )}

      {!isLandscape && (
        <View className="px-6 pb-3 z-10">
          <AdminTabs activeTab={activeTab} onChangeTab={setActiveTab} />
        </View>
      )}

      {activeTab === "requests" ? (
        <RequestsList
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
          showInlineTabs={isLandscape}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />
      ) : (
        <AuditTable
          auditLogs={auditLogs}
          isLoading={isLoading}
          auditSearchEmail={auditSearchEmail}
          onChangeSearchEmail={setAuditSearchEmail}
          onSearch={handleSearchAudits}
          onShowAll={handleShowAllAudits}
          showInlineTabs={isLandscape}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />
      )}
    </View>
  );
};

export default AdminScreen;
