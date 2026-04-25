import ProfilePic from "@components/profile/ProfilePic";
import { useProfilePicture } from "@hooks/useProfilePicture";
import React from "react";

interface ProfilePictureProps {
  userId: string;
  handleClick?: () => void;
  size?: number;
}

/**
 * ProfilePicture
 * A UI component that resolves a user's profile picture by their ID
 * and renders it within a touchable container.
 */
const ProfilePicture = ({ userId, handleClick, size = 48 }: ProfilePictureProps) => {
  const { avatarUrl, isLoading } = useProfilePicture(userId);

  return (
    <ProfilePic
      avatarUrl={avatarUrl}
      size={size}
      onPress={handleClick}
      isUploading={isLoading}
    />
  );
};

export default ProfilePicture;
