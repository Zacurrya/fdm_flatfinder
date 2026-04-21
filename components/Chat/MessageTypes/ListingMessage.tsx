import ChatListingCard from "@components/Chat/ChatListingCard";
import { decodeListingShareMessage } from "@utils/chatListingShare";
import { Text, View } from "react-native";
import { MessageProps } from "./types";

export default function ListingMessage({
  content,
  timeLabel,
  isMe,
  senderName,
  showSenderName = false,
}: MessageProps) {
  const bubbleClassName = "max-w-[78%] py-1";
  const timestampClassName = `text-xs mt-1 text-fdm-fg/40 ${isMe ? "text-right" : ""}`;

  const sharedListingId = decodeListingShareMessage(content.trim());
  if (!sharedListingId) return null;

  return (
    <View className={bubbleClassName}>
      {!isMe && showSenderName && senderName ? (
        <Text className="text-fdm-accent/80 text-sm font-semibold mb-1">
          {senderName}
        </Text>
      ) : null}

      <ChatListingCard listingId={sharedListingId} />

      <Text className={timestampClassName}>{timeLabel}</Text>
    </View>
  );
}
