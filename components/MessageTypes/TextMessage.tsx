import { Text, View } from "react-native";
import { MessageProps } from "./types";

export default function TextMessage({
  content,
  timeLabel,
  isMe,
  senderName,
  showSenderName = false,
}: MessageProps) {
  const bubbleClassName = `max-w-[75%] px-2.5 py-2 rounded-2xl ${
    isMe
      ? "bg-fdm-accent rounded-tr-sm"
      : "bg-fdm-fg/10 border border-fdm-fg/10 rounded-tl-sm"
  }`;

  const timestampClassName = `text-xs mt-1 ${
    isMe ? "text-fdm-bg/60 text-right" : "text-fdm-fg/40"
  }`;

  return (
    <View className={bubbleClassName}>
      {!isMe && showSenderName && senderName ? (
        <Text className="text-fdm-accent/80 text-sm font-semibold mb-1">
          {senderName}
        </Text>
      ) : null}

      <Text className={isMe ? "text-fdm-bg font-medium" : "text-fdm-fg"}>
        {content}
      </Text>

      <Text className={timestampClassName}>{timeLabel}</Text>
    </View>
  );
}
