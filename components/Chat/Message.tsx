import { MessageRecord } from "@/types/records";
import MessageBuilder from "@components/Chat/MessageTypes/MessageBuilder";
import { formatTime } from "@utils/formatters";

type MessageProps = {
  item: MessageRecord;
  isMe: boolean;
  senderName: string;
  senderProfilePicture: string | null;
  senderInitials: string;
  showDateSeparator: boolean;
  isPreviousFromSameSender: boolean;
};

export const Message = ({
  item,
  isMe,
  senderName,
  senderProfilePicture,
  senderInitials,
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
      avatarProfilePicture={senderProfilePicture}
      avatarInitials={senderInitials}
      avatarVisible={!isMe && !isPreviousFromSameSender}
    />
  );
};
