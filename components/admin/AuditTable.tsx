import { Ionicons } from "@expo/vector-icons";
import { AuditLog } from "@services/audit/types";
import { getAuditActionDisplay } from "@utils/auditActionDisplay";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import AdminTabs from "./AdminTabs";

type AuditTableProps = {
  auditLogs: AuditLog[];
  isLoading: boolean;
  auditError: string;
  auditSearchEmail: string;
  onChangeSearchEmail: (value: string) => void;
  onSearch: () => void;
  onShowAll: () => void;
  showInlineTabs?: boolean;
  activeTab?: "requests" | "audits";
  onChangeTab?: (tab: "requests" | "audits") => void;
};

export default function AuditTable({
  auditLogs,
  isLoading,
  auditError,
  auditSearchEmail,
  onChangeSearchEmail,
  onSearch,
  onShowAll,
  showInlineTabs = false,
  activeTab = "audits",
  onChangeTab,
}: AuditTableProps) {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const { width } = useWindowDimensions();
  const tableMinWidth = Math.max(760, width - 48);

  const toggleReveal = (key: string) => {
    setRevealedIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View className="flex-1 px-6 pt-2">
      {/* Toolbar */}
      <View className="flex-row items-center gap-2 mb-4">
        {showInlineTabs && onChangeTab ? (
          <AdminTabs activeTab={activeTab} onChangeTab={onChangeTab} />
        ) : null}

        <TextInput
          className="flex-1 h-12 bg-fdm-fg/5 border border-fdm-fg/10 rounded-xl px-4 text-fdm-fg"
          value={auditSearchEmail}
          onChangeText={onChangeSearchEmail}
          placeholder="Search by user email"
          placeholderTextColor="#ffffff66"
          autoCapitalize="none"
          keyboardType="email-address"
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity
          className="h-12 px-4 rounded-xl bg-fdm-accent items-center justify-center"
          onPress={onSearch}
        >
          <Text className="text-fdm-bg font-bold text-xs uppercase">Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="h-12 px-4 rounded-xl border border-fdm-fg/20 items-center justify-center"
          onPress={onShowAll}
        >
          <Text className="text-fdm-fg/80 font-semibold text-xs uppercase">All</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ccff00" size="large" />
        </View>
      ) : auditError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-400 text-sm text-center">{auditError}</Text>
        </View>
      ) : auditLogs.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="document-text-outline" size={48} color="#ccff0030" />
          <Text className="text-fdm-fg/50 text-base text-center mt-4">No audit entries found.</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View className="rounded-2xl border border-fdm-fg/10 overflow-hidden" style={{ minWidth: tableMinWidth }}>
              {/* Table Header */}
              <View className="flex-row bg-fdm-fg/10 px-3 py-3">
                <Text className="w-20 text-fdm-fg/60 text-xs font-semibold uppercase">ID</Text>
                <Text className="w-52 text-fdm-fg/60 text-xs font-semibold uppercase">Timestamp</Text>
                <Text className="w-52 text-fdm-fg/60 text-xs font-semibold uppercase">Action</Text>
                <Text className="w-40 text-fdm-fg/60 text-xs font-semibold uppercase">User (actor)</Text>
                <Text className="w-40 text-fdm-fg/60 text-xs font-semibold uppercase">Target</Text>
              </View>

              {auditLogs.map((item) => {
                const rowKey = `${item.auditId}-${item.timeStamp}`;
                const userRevealKey = `${rowKey}-user`;
                const targetRevealKey = `${rowKey}-target`;
                const userEmail = item.userEmail || "Unknown";
                const targetEmail = item.targetEmail || "Unknown";
                const actionDisplay = getAuditActionDisplay(item.actionType);

                // Self-action (requested events where actor = target)
                const isSelfAction = item.userId === item.targetId;

                return (
                  <View key={rowKey} className="flex-row border-t border-fdm-fg/10 px-3 py-3 items-start">
                    <Text className="w-20 text-fdm-fg/50 text-xs" numberOfLines={1}>
                      {String(item.auditId)}
                    </Text>
                    <Text className="w-52 text-fdm-fg/50 text-xs" numberOfLines={1}>
                      {new Date(item.timeStamp).toLocaleString()}
                    </Text>
                    <View className="w-52">
                      <Text style={{ color: actionDisplay.color }} className="text-xs font-medium" numberOfLines={1}>
                        {actionDisplay.label}
                      </Text>
                    </View>
                    <View className="w-40 pr-3">
                      <Pressable onPress={() => toggleReveal(userRevealKey)}>
                        <Text className="text-fdm-fg text-xs underline" numberOfLines={1}>{userEmail}</Text>
                      </Pressable>
                      {revealedIds[userRevealKey] && (
                        <Text className="text-fdm-fg/40 text-[11px] mt-1" numberOfLines={1}>{item.userId}</Text>
                      )}
                    </View>
                    <View className="w-40 pr-3">
                      {isSelfAction ? (
                        <Text className="text-fdm-fg/30 text-xs italic" numberOfLines={1}>self</Text>
                      ) : (
                        <>
                          <Pressable onPress={() => toggleReveal(targetRevealKey)}>
                            <Text className="text-fdm-fg text-xs underline" numberOfLines={1}>{targetEmail}</Text>
                          </Pressable>
                          {revealedIds[targetRevealKey] && (
                            <Text className="text-fdm-fg/40 text-[11px] mt-1" numberOfLines={1}>{item.targetId}</Text>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
}
