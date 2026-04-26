import { Text } from "react-native";
import { MessageProps } from "./types";
import MessageBubble from "../MessageBubble";

const TextMessage = ({
  content,
  timeLabel,
  isMe,
  senderName,
  showSenderName = false,
}: MessageProps) => {
  const timestampClassName = `text-xs mt-1 ${isMe ? "text-fdm-bg/60 text-right" : "text-fdm-fg/40"
    }`;

  return (
    <MessageBubble isMe={isMe}>
      {!isMe && showSenderName && senderName ? (
        <Text className="text-fdm-accent/80 text-sm font-semibold mb-1">
          {senderName}
        </Text>
      ) : null}

      <Text className={isMe ? "text-fdm-bg font-medium" : "text-fdm-fg"}>
        {content}
      </Text>

      <Text numberOfLines={1} className={timestampClassName}>{timeLabel}</Text>
    </MessageBubble>
  );
};

export default TextMessage;
