export type MessageProps = {
  content: string;
  timeLabel: string;
  isMe: boolean;
  senderName?: string;
  showSenderName?: boolean;
  createdAt: string;
  showDateSeparator?: boolean;
  avatarProfilePicture?: string | null;
  avatarInitials?: string;
  avatarVisible?: boolean;
};
