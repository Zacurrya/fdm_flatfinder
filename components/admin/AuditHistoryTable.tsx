import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { AuditLog } from "../../services/audit/auditTypes";

type AuditHistoryTableProps = {
  auditLogs: AuditLog[];
  isLoading: boolean;
  auditError: string;
  auditSearchEmail: string;
  onChangeSearchEmail: (value: string) => void;
  onSearch: () => void;
  onShowAll: () => void;
};

export default function AuditHistoryTable({
  auditLogs,
  isLoading,
  auditError,
  auditSearchEmail,
  onChangeSearchEmail,
  onSearch,
  onShowAll,
}: AuditHistoryTableProps) {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const { width } = useWindowDimensions();
  const tableMinWidth = Math.max(900, width - 48);

  const toggleReveal = (key: string) => {
    setRevealedIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View className="flex-1 px-6 pt-2">
      <View className="flex-row items-center gap-2 mb-4">
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
          <Text className="text-fdm-fg/50 text-base text-center">No audit entries found.</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          <View className="rounded-2xl border border-fdm-fg/10 overflow-hidden" style={{ minWidth: tableMinWidth }}>
            <View className="flex-row bg-fdm-fg/10 px-3 py-3">
              <Text className="w-20 text-fdm-fg text-xs font-semibold uppercase">Audit ID</Text>
              <Text className="w-52 text-fdm-fg text-xs font-semibold uppercase">Timestamp</Text>
              <Text className="w-44 text-fdm-fg text-xs font-semibold uppercase">Action</Text>
              <Text className="w-80 text-fdm-fg text-xs font-semibold uppercase">User</Text>
              <Text className="w-30 text-fdm-fg text-xs font-semibold uppercase">Target</Text>
            </View>
            {auditLogs.map((item) => {
              const rowKey = `${item.auditId}-${item.timeStamp}`;
              const userRevealKey = `${rowKey}-user`;
              const targetRevealKey = `${rowKey}-target`;
              const userEmail = item.userEmail || "Unknown user";
              const targetEmail = item.targetEmail || "Unknown user";

              return (
              <View key={rowKey} className="flex-row border-t border-fdm-fg/10 px-3 py-3">
                <Text className="w-20 text-fdm-fg/70 text-xs" numberOfLines={1}>{String(item.auditId)}</Text>
                <Text className="w-52 text-fdm-fg/70 text-xs" numberOfLines={1}>
                  {new Date(item.timeStamp).toLocaleString()}
                </Text>
                <Text className="w-44 text-fdm-accent text-xs" numberOfLines={1}>{item.actionType}</Text>
                <View className="w-80 pr-3">
                  <Pressable onPress={() => toggleReveal(userRevealKey)}>
                    <Text className="text-fdm-fg text-xs underline" numberOfLines={1}>{userEmail}</Text>
                  </Pressable>
                  {revealedIds[userRevealKey] ? (
                    <Text className="text-fdm-fg/50 text-[11px] mt-1" numberOfLines={1}>{item.userId}</Text>
                  ) : null}
                </View>
                <View className="w-60 pr-3">
                  <Pressable onPress={() => toggleReveal(targetRevealKey)}>
                    <Text className="text-fdm-fg text-xs underline" numberOfLines={1}>{targetEmail}</Text>
                  </Pressable>
                  {revealedIds[targetRevealKey] ? (
                    <Text className="text-fdm-fg/50 text-[11px] mt-1" numberOfLines={1}>{item.targetId}</Text>
                  ) : null}
                </View>
              </View>
            )})}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
