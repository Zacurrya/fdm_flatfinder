import { decodeListingShareMessage } from "@utils/chatListingShare";
import {
  extractAuditMessage,
  isAuditPayload,
  isImagePayload,
} from "@utils/mediaParser";
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
  if (isImagePayload(trimmedContent)) {
    return <ImageMessage {...props} />;
  }

  // 3. Check if Audit
  if (isAuditPayload(trimmedContent)) {
    return <AuditMessage {...props} content={extractAuditMessage(trimmedContent)} />;
  }

  // 4. Fallback to normal Text Message
  return <TextMessage {...props} />;
}
