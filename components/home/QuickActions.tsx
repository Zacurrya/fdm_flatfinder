import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

const QUICK_ACTIONS = [
  { icon: "search-outline", label: "Search" },
  { icon: "add-circle-outline", label: "Upload" },
  { icon: "filter-outline", label: "Filters" },
  { icon: "notifications-outline", label: "Alerts" },
] as const;

export default function QuickActions() {
  return (
    <View className="flex-row px-6 gap-3 mt-2 mb-6">
      {QUICK_ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.label}
          className="flex-1 bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl py-4 items-center gap-1 active:bg-fdm-fg/10"
        >
          <Ionicons name={action.icon} size={22} color="#ccff00" />
          <Text className="text-fdm-fg/70 text-xs font-medium">{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
