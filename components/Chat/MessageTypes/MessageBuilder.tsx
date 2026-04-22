import { decodeListingShareMessage } from "@utils/chatListingShare";
import {
  extractAuditMessage,
  isAuditPayload,
  isImagePayload,
} from "@utils/mediaParser";
import { View } from "react-native";
import MessageAvatar from "../MessageAvatar";
import AuditMessage from "./AuditMessage";
import DateMessage from "./DateMessage";
import ImageMessage from "./ImageMessage";
import ListingMessage from "./ListingMessage";
import TextMessage from "./TextMessage";
import { MessageProps } from "./types";

/**
 * 
 * @param 
  * @returns Takes in a message and determines which type of message it is (text, image, listing share, audit) and renders the appropriate component for it. It also handles rendering the date separator and avatar for the message. 
 */
export default function MessageBuilder(props: MessageProps) {
  const {
    content,
    isMe,
    avatarProfilePicture,
    avatarInitials,
    avatarVisible = true,
    showDateSeparator,
    createdAt,
  } = props;
  const trimmedContent = content.trim();

  const renderContent = () => {
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
      return (
        <AuditMessage
          {...props}
          content={extractAuditMessage(trimmedContent)}
        />
      );
    }

    // 4. Fallback to normal Text Message
    return <TextMessage {...props} />;
  };

  return (
    <>
      {showDateSeparator && <DateMessage date={createdAt} />}

      <View
        className={`flex-row mb-1 px-4 items-start ${
          isMe ? "justify-end" : "justify-start"
        }`}
      >
        {!isMe ? (
          <MessageAvatar
            profilePicture={avatarProfilePicture}
            initials={avatarInitials || ""}
            visible={avatarVisible}
          />
        ) : null}

        {renderContent()}
      </View>
    </>
  );
}
