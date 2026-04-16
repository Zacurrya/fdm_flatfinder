import { User } from "@services/auth/auth.types";
import {
  getFallbackProfilePictureInitials,
  getFallbackProfilePictureUrl,
  getProfilePictureUrl,
} from "@services/user/userService";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type ProfilePicProps = {
  user: User | null;
  onPress?: () => void;
  isUploadingProfilePicture?: boolean;
  size?: number;
};

export default function ProfilePic({
  user,
  onPress,
  isUploadingProfilePicture = false,
  size = 64,
}: ProfilePicProps) {
  const fallbackProfilePictureUrl = getFallbackProfilePictureUrl({
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    size,
  });
  const fallbackInitials = getFallbackProfilePictureInitials({
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
  });

  const [resolvedProfilePictureUrl, setResolvedProfilePictureUrl] = useState<string | null>(null);
  const [hasProfilePictureLoadError, setHasProfilePictureLoadError] = useState(false);
  const [hasFallbackProfilePictureLoadError, setHasFallbackProfilePictureLoadError] = useState(false);

  useEffect(() => {
    setHasProfilePictureLoadError(false);
    setHasFallbackProfilePictureLoadError(false);

    let cancelled = false;

    const loadSignedProfilePictureUrl = async () => {
      const resolvedUrl = await getProfilePictureUrl({
        profilePicture: user?.profilePicture,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        size,
      });

      if (cancelled) {
        return;
      }

      setResolvedProfilePictureUrl(resolvedUrl);
    };

    void loadSignedProfilePictureUrl();

    return () => {
      cancelled = true;
    };
  }, [user?.email, user?.firstName, user?.lastName, user?.profilePicture, size]);

  const isUsingResolvedProfilePicture = !hasProfilePictureLoadError && Boolean(resolvedProfilePictureUrl);

  const profilePictureUrl = isUsingResolvedProfilePicture
    ? resolvedProfilePictureUrl
    : fallbackProfilePictureUrl;

  const safeProfilePictureUrl = profilePictureUrl ?? fallbackProfilePictureUrl;

  const radius = size / 2;

  const handleImageError = () => {
    if (isUsingResolvedProfilePicture) {
      setHasProfilePictureLoadError(true);
      return;
    }

    setHasFallbackProfilePictureLoadError(true);
  };

  return (
    <TouchableOpacity
      className="rounded-full bg-fdm-accent/15 border border-fdm-accent/20 items-center justify-center"
      style={{ width: size, height: size, borderRadius: radius }}
      onPress={onPress}
      disabled={!onPress || isUploadingProfilePicture}
      accessibilityLabel="Open profile picture"
      accessibilityRole="button"
    >
      {hasFallbackProfilePictureLoadError ? (
        <Text className="text-fdm-bg font-bold" style={{ fontSize: Math.max(14, size * 0.3) }}>
          {fallbackInitials}
        </Text>
      ) : (
        <Image
          key={safeProfilePictureUrl}
          source={{ uri: safeProfilePictureUrl }}
          style={{ width: size, height: size, borderRadius: radius }}
          contentFit="cover"
          cachePolicy="memory-disk"
          onError={handleImageError}
        />
      )}

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
