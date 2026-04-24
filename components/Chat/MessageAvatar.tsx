import React from "react";
import { View } from "react-native";
import ProfilePic from "@components/profile/ProfilePic";

type MessageAvatarProps = {
  profilePicture?: string | null;
  initials: string;
  visible?: boolean;
};

/**
 * MessageAvatar
 * Wrapper around ProfilePic for use in chat messages.
 */
const MessageAvatar = ({
  profilePicture,
  initials,
  visible = true,
}: MessageAvatarProps) => {
  return (
    <View className="w-12 h-12 mr-2">
      {visible ? (
        <ProfilePic
          avatarUrl={profilePicture ?? null}
          initials={initials}
          size={48}
        />
      ) : null}
    </View>
  );
};

export default MessageAvatar;
