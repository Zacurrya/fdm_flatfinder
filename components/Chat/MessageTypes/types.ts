export type MessageProps = {
  content: string;
  timeLabel: string;
  isMe: boolean;
  senderId?: string;
  senderName?: string;
  showSenderName?: boolean;
  createdAt: string;
  showDateSeparator?: boolean;
  avatarUrl?: string | null;
  avatarVisible?: boolean;
};
