import { decodeListingShareMessage } from "@/utils/chatListingShare";
import ChatListingCard from "@components/Chat/ChatListingCard";
import { Image, Text, View } from "react-native";

type MessageBubbleProps = {
  content: string;
  timeLabel: string;
  isMe: boolean;
  senderName?: string;
  showSenderName?: boolean;
};

export default function MessageBubble({
  content,
  timeLabel,
  isMe,
  senderName,
  showSenderName = false,
}: MessageBubbleProps) {
  const trimmedContent = content.trim();
  const sharedListingId = decodeListingShareMessage(trimmedContent);
  const isImageMessage = /^https?:\/\/.+\.(png|jpe?g|gif|webp|heic)(\?.*)?$/i.test(trimmedContent)
    || trimmedContent.includes("/storage/v1/object/public/");
  const usesContentCardLayout = sharedListingId || isImageMessage;

  const bubbleClassName = usesContentCardLayout
    ? "max-w-[78%] py-1"
    : `max-w-[75%] px-2.5 py-2 rounded-2xl ${
        isMe
          ? "bg-fdm-accent rounded-tr-sm"
          : "bg-fdm-fg/10 border border-fdm-fg/10 rounded-tl-sm"
      }`;

  const timestampClassName = usesContentCardLayout
    ? `text-xs mt-1 text-fdm-fg/40 ${isMe ? "text-right" : ""}`
    : `text-xs mt-1 ${isMe ? "text-fdm-bg/60 text-right" : "text-fdm-fg/40"}`;

  return (
    <View className={bubbleClassName}>
      {!isMe && showSenderName && senderName ? (
        <Text className="text-fdm-accent/80 text-sm font-semibold mb-1">{senderName}</Text>
      ) : null}

      {sharedListingId ? (
        <ChatListingCard listingId={sharedListingId} />
      ) : isImageMessage ? (
        <Image
          source={{ uri: trimmedContent }}
          className="w-48 h-48 rounded-xl"
          resizeMode="cover"
        />
      ) : (
        <Text className={isMe ? "text-fdm-bg font-medium" : "text-fdm-fg"}>{content}</Text>
      )}

      <Text className={timestampClassName}>
        {timeLabel}
      </Text>
    </View>
  );
}
