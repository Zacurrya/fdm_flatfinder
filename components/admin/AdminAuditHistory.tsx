import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AuditLog } from "../../services/audit/auditTypes";

type AdminAuditHistoryProps = {
  auditLogs: AuditLog[];
  isLoading: boolean;
  auditError: string;
  auditSearchEmail: string;
  onChangeSearchEmail: (value: string) => void;
  onSearch: () => void;
  onShowAll: () => void;
};

export default function AdminAuditHistory({
  auditLogs,
  isLoading,
  auditError,
  auditSearchEmail,
  onChangeSearchEmail,
  onSearch,
  onShowAll,
}: AdminAuditHistoryProps) {
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
          <View className="rounded-2xl border border-fdm-fg/10 overflow-hidden" style={{ minWidth: 1160 }}>
            <View className="flex-row bg-fdm-fg/10 px-3 py-3">
              <Text className="w-20 text-fdm-fg text-xs font-semibold uppercase">Audit ID</Text>
              <Text className="w-52 text-fdm-fg text-xs font-semibold uppercase">Timestamp</Text>
              <Text className="w-44 text-fdm-fg text-xs font-semibold uppercase">Action</Text>
              <Text className="w-72 text-fdm-fg text-xs font-semibold uppercase">User ID</Text>
              <Text className="w-72 text-fdm-fg text-xs font-semibold uppercase">Target ID</Text>
            </View>
            {auditLogs.map((item) => (
              <View key={`${item.auditId}-${item.timeStamp}`} className="flex-row border-t border-fdm-fg/10 px-3 py-3">
                <Text className="w-20 text-fdm-fg/70 text-xs" numberOfLines={1}>{String(item.auditId)}</Text>
                <Text className="w-52 text-fdm-fg/70 text-xs" numberOfLines={1}>
                  {new Date(item.timeStamp).toLocaleString()}
                </Text>
                <Text className="w-44 text-fdm-accent text-xs" numberOfLines={1}>{item.actionType}</Text>
                <Text className="w-72 text-fdm-fg/70 text-xs" numberOfLines={1}>{item.userId}</Text>
                <Text className="w-72 text-fdm-fg/70 text-xs" numberOfLines={1}>{item.targetId}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
