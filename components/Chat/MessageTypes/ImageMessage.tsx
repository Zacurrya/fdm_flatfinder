import { IMAGE_URL_REGEX } from "@utils/formatters";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import MessageBubble from "../MessageBubble";
import { MessageProps } from "./types";

const ImageMessage = ({
  content,
  timeLabel,
  isMe,
  senderName,
  showSenderName = false,
}: MessageProps) => {
  const [aspectRatio, setAspectRatio] = useState(1);
  const timestampClassName = `text-[10px] mt-1 px-1 ${isMe ? "text-fdm-bg/60 text-right" : "text-fdm-fg/40" // Message timestamp
    }`;

  // Find the image URL, matches extensions or the Supabase standard storage path.
  const match = content.match(IMAGE_URL_REGEX);

  const imageUrl = match ? match[0] : content.trim();
  const caption = match ? content.replace(imageUrl, "").trim() : "";

  // Calculate aspect ratio and produce fallback if it doesn't load
  useEffect(() => {
    if (imageUrl) {
      Image.getSize(imageUrl, (width, height) => {
        setAspectRatio(width / height);
      }, () => {
        <Text>Image not found</Text>
      });
    }
  }, [imageUrl]);

  return (
    <MessageBubble isMe={isMe} xPadding={1} topPadding={2} bottomPadding={2}>
      {/* Sender name if another user */}
      {!isMe && showSenderName && senderName ? (
        <Text className="text-fdm-accent/80 text-sm font-semibold mb-1 px-1">
          {senderName}
        </Text>
      ) : null}


      <View
        className="bg-black/5 rounded-xl overflow-hidden"
        style={{
          width: Math.min(180 * aspectRatio),
          maxWidth: '100%',
          aspectRatio: aspectRatio
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {caption ? (
        <Text className={`mt-2 font-medium px-1.5 ${isMe ? "text-fdm-bg" : "text-fdm-fg"}`}>{caption}</Text>
      ) : null}

      <Text numberOfLines={1} className={timestampClassName}>{timeLabel}</Text>
    </MessageBubble>
  );
};

export default ImageMessage;
