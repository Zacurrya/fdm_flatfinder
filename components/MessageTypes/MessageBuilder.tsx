import { decodeListingShareMessage } from "@/utils/chatListingShare";
import AuditMessage from "./AuditMessage";
import ImageMessage from "./ImageMessage";
import ListingMessage from "./ListingMessage";
import TextMessage from "./TextMessage";
import { MessageProps } from "./types";

export default function MessageBuilder(props: MessageProps) {
  const { content } = props;
  const trimmedContent = content.trim();

  // 1. Check if Listing Share
  if (decodeListingShareMessage(trimmedContent)) {
    return <ListingMessage {...props} />;
  }

  // 2. Check if Image
  const isImageRegex = /(https?:\/\/[^\s]+(\.(png|jpe?g|gif|webp|heic)(\?.*)?|\/storage\/v1\/object\/public\/[^\s]+))/i;
  if (isImageRegex.test(trimmedContent)) {
    return <ImageMessage {...props} />;
  }

  // 3. Check if Audit (assuming audit messages start with some special prefix, 
  // or we can detect them via specific system patterns. For now we use a common marker)
  if (trimmedContent.startsWith("[AUDIT]") || trimmedContent.startsWith("System:")) {
    return <AuditMessage {...props} content={trimmedContent.replace(/^(\[AUDIT\]|System:)\s*/i, "")} />;
  }

  // 4. Fallback to normal Text Message
  return <TextMessage {...props} />;
}
