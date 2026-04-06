import { Text, TouchableOpacity, View } from "react-native";

type AdminTab = "requests" | "audits";

type AdminTabsProps = {
  activeTab: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
};

export default function AdminTabs({ activeTab, onChangeTab }: AdminTabsProps) {
  return (
    <View className="flex-row gap-2">
      <TouchableOpacity
        className={`px-4 py-2 rounded-xl border ${
          activeTab === "requests"
            ? "bg-fdm-accent/20 border-fdm-accent"
            : "bg-fdm-fg/5 border-fdm-fg/10"
        }`}
        onPress={() => onChangeTab("requests")}
      >
        <Text
          className={`${activeTab === "requests" ? "text-fdm-accent" : "text-fdm-fg/70"} text-xs font-semibold uppercase`}
        >
          Validation Requests
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`px-4 py-2 rounded-xl border ${
          activeTab === "audits"
            ? "bg-fdm-accent/20 border-fdm-accent"
            : "bg-fdm-fg/5 border-fdm-fg/10"
        }`}
        onPress={() => onChangeTab("audits")}
      >
        <Text
          className={`${activeTab === "audits" ? "text-fdm-accent" : "text-fdm-fg/70"} text-xs font-semibold uppercase`}
        >
          Audit Log History
        </Text>
      </TouchableOpacity>
    </View>
  );
}
