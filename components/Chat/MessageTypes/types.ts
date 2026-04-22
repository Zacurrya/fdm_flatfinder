export type MessageProps = {
  content: string;
  timeLabel: string;
  isMe: boolean;
  senderId?: string;
  senderName?: string;
  showSenderName?: boolean;
  createdAt: string;
  showDateSeparator?: boolean;
  avatarProfilePicture?: string | null;
  avatarInitials?: string;
  avatarVisible?: boolean;
};
