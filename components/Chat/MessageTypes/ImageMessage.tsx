import { IMAGE_URL_REGEX } from "@utils/mediaParser";
import { Image, Text, View } from "react-native";
import { MessageProps } from "./types";

export default function ImageMessage({
  content,
  timeLabel,
  isMe,
  senderName,
  showSenderName = false,
}: MessageProps) {
  const bubbleClassName = "max-w-[78%] py-1";
  const timestampClassName = `text-xs mt-1 text-fdm-fg/40 ${isMe ? "text-right" : ""}`;

  // Find the image URL.
  // We match extensions or the Supabase standard storage path.
  const match = content.match(IMAGE_URL_REGEX);

  const imageUrl = match ? match[0] : content.trim();
  const caption = match ? content.replace(imageUrl, "").trim() : "";

  return (
    <View className={bubbleClassName}>
      {!isMe && showSenderName && senderName ? (
        <Text className="text-fdm-accent/80 text-sm font-semibold mb-1">
          {senderName}
        </Text>
      ) : null}

      <Image
        source={{ uri: imageUrl }}
        className="w-48 h-48 rounded-xl"
        resizeMode="cover"
      />

      {caption ? (
        <Text className="text-fdm-fg mt-2 font-medium">{caption}</Text>
      ) : null}

      <Text className={timestampClassName}>{timeLabel}</Text>
    </View>
  );
}
