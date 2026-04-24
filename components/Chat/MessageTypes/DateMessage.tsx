import { Text, View } from "react-native";

type DateMessageProps = {
  date: string | Date;
};

const DateMessage = ({ date }: DateMessageProps) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return (
    <View className="items-center my-3">
      <Text className="text-fdm-fg/30 text-xs bg-fdm-fg/5 px-3 py-1 rounded-full">
        {dateObj.toLocaleDateString([], {
          weekday: "short",
          day: "numeric",
          month: "short",
        })}
      </Text>
    </View>
  );
};

export default DateMessage;
