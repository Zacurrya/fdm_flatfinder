import { MessageRecord } from "@/types/records";
import MessageBuilder from "@components/Chat/MessageTypes/MessageBuilder";
import { formatTime } from "@utils/formatters";

type MessageProps = {
  item: MessageRecord;
  isMe: boolean;
  senderName: string;
  senderAvatarUrl?: string | null;
  showDateSeparator: boolean;
  isPreviousFromSameSender: boolean;
};

export const Message = ({
  item,
  isMe,
  senderName,
  senderAvatarUrl,
  showDateSeparator,
  isPreviousFromSameSender,
}: MessageProps) => {
  return (
    <MessageBuilder
      content={item.content}
      timeLabel={formatTime(item.createdAt)}
      isMe={isMe}
      senderName={senderName}
      showSenderName={false}
      createdAt={item.createdAt}
      showDateSeparator={showDateSeparator}
      avatarUrl={senderAvatarUrl}
      avatarVisible={!isMe && !isPreviousFromSameSender}
    />
  );
};
