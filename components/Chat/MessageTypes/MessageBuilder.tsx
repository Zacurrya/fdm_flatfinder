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
import TextMessage from "./TextMessage";
import { MessageProps } from "./types";

/**
 * MessageBuilder
 * Determines which type of message to render and handles shared elements like avatars and date separators.
 */
const MessageBuilder = (props: MessageProps) => {
  const {
    content,
    isMe,
    avatarUrl,
    avatarVisible = true,
    showDateSeparator,
    createdAt,
  } = props;
  const trimmedContent = content.trim();

  const renderContent = () => {
    // 1. Check if Image
    if (isImagePayload(trimmedContent)) {
      return <ImageMessage {...props} content={trimmedContent} />;
    }

    // 2. Check if Audit
    if (isAuditPayload(trimmedContent)) {
      return <AuditMessage {...props} content={extractAuditMessage(trimmedContent)} />;
    }

    // 3. Fallback to Text
    return <TextMessage {...props} content={trimmedContent} />;
  };

  return (
    <View>
      {showDateSeparator ? <DateMessage date={createdAt} /> : null}

      <View
        className={`flex-row mb-1 px-4 items-start ${isMe ? "justify-end" : "justify-start"
          }`}
      >
        {!isMe ? (
          <MessageAvatar
            avatarUrl={avatarUrl}
            visible={avatarVisible}
          />
        ) : null}

        <View className={`max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
          {renderContent()}
        </View>
      </View>
    </View>
  );
};

export default MessageBuilder;
