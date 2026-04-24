import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

type AdminTab = "requests" | "audits";

type AdminTabsProps = {
  activeTab: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
};

const TABS: { key: AdminTab; label: string }[] = [
  { key: "requests", label: "Requests" },
  { key: "audits", label: "Audit Logs" },
];

const AdminTabs = ({ activeTab, onChangeTab }: AdminTabsProps) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <View className={`flex-row ${isLandscape ? "gap-1" : "gap-2"}`}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          className={`${isLandscape ? "px-2 py-1.5 rounded-lg" : "px-3 py-2 rounded-xl"} border ${
            activeTab === tab.key
              ? "bg-fdm-accent/20 border-fdm-accent"
              : "bg-fdm-fg/5 border-fdm-fg/10"
          }`}
          onPress={() => onChangeTab(tab.key)}
        >
          <Text
            className={`${
              activeTab === tab.key ? "text-fdm-accent" : "text-fdm-fg/70"
            } ${isLandscape ? "text-[10px]" : "text-xs"} font-semibold uppercase`}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default AdminTabs;
