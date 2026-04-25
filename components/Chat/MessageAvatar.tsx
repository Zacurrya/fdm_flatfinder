import ProfilePic from "@components/profile/ProfilePic";
import React from "react";
import { View } from "react-native";

type MessageAvatarProps = {
  avatarUrl?: string | null;
  visible?: boolean;
};

/**
 * MessageAvatar
 * Wrapper around ProfilePic for use in chat messages.
 */
const MessageAvatar = ({
  avatarUrl,
  visible = true,
}: MessageAvatarProps) => {
  return (
    <View className="w-12 h-12 mr-2">
      {visible ? (
        <ProfilePic
          avatarUrl={avatarUrl ?? null}
          size={48}
        />
      ) : null}
    </View>
  );
};

export default MessageAvatar;
