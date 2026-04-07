import { User } from "@services/auth/auth.types";
import { getProfilePictureUrl } from "@services/user/userService";
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

type ProfileAvatarProps = {
  user: User | null;
  onPress?: () => void;
  isUploadingProfilePicture?: boolean;
  size?: number;
};

export default function ProfileAvatar({
  user,
  onPress,
  isUploadingProfilePicture = false,
  size = 64,
}: ProfileAvatarProps) {
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const fallbackName = fullName || user?.email || "User";
  const fallbackProfilePictureUrl = useMemo(
    () => `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&size=${Math.max(128, size * 2)}`,
    [fallbackName, size]
  );
  const [resolvedProfilePictureUrl, setResolvedProfilePictureUrl] = useState<string | null>(null);
  const [hasProfilePictureLoadError, setHasProfilePictureLoadError] = useState(false);

  useEffect(() => {
    setHasProfilePictureLoadError(false);

    let cancelled = false;

    const loadSignedProfilePictureUrl = async () => {
      const resolvedUrl = await getProfilePictureUrl(user?.profilePicture);

      if (cancelled) {
        return;
      }

      setResolvedProfilePictureUrl(resolvedUrl);
    };

    void loadSignedProfilePictureUrl();

    return () => {
      cancelled = true;
    };
  }, [user?.profilePicture]);

  const profilePictureUrl = !hasProfilePictureLoadError && resolvedProfilePictureUrl
    ? resolvedProfilePictureUrl
    : fallbackProfilePictureUrl;

  const radius = size / 2;

  return (
    <TouchableOpacity
      className="rounded-full bg-fdm-accent/15 border border-fdm-accent/20 items-center justify-center"
      style={{ width: size, height: size, borderRadius: radius }}
      onPress={onPress}
      disabled={!onPress || isUploadingProfilePicture}
      accessibilityLabel="Open profile picture"
      accessibilityRole="button"
    >
      <Image
        key={profilePictureUrl}
        source={{ uri: profilePictureUrl }}
        style={{ width: size, height: size, borderRadius: radius }}
        contentFit="cover"
        cachePolicy="none"
        onError={() => setHasProfilePictureLoadError(true)}
      />

      {isUploadingProfilePicture && (
        <View
          className="absolute inset-0 rounded-full bg-black/35 items-center justify-center"
          pointerEvents="none"
        >
          <ActivityIndicator size="small" color="#ffffff" />
        </View>
      )}
    </TouchableOpacity>
  );
}
