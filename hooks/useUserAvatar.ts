import { getProfilePictureUrl, getFallbackProfilePictureInitials } from "@services/user/userService";
import { User } from "@services/auth/types";
import { useEffect, useState } from "react";

/**
 * useUserAvatar Hook
 * Resolves a user's avatar source (signed URL or fallback) and initials.
 * 
 * @param user The user object to resolve the avatar for.
 * @returns avatarUrl (resolved image path), initials (text fallback), and loading state.
 */
export function useUserAvatar(user: User | null | undefined) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>("U");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      setInitials("U");
      setLoading(false);
      return;
    }

    // Set initials immediately as they don't require async fetching
    const userInitials = getFallbackProfilePictureInitials({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
    setInitials(userInitials);

    let isMounted = true;

    const fetchAvatar = async () => {
      setLoading(true);
      try {
        const url = await getProfilePictureUrl({
          profilePicture: user.profilePicture,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });
        
        if (isMounted) {
          setAvatarUrl(url);
        }
      } catch (error) {
        console.error("[useUserAvatar] Failed to resolve avatar URL:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchAvatar();

    return () => {
      isMounted = false;
    };
  }, [user?.userId, user?.profilePicture, user?.firstName, user?.lastName, user?.email]);

  return { 
    avatarUrl, 
    initials, 
    loading,
    hasProfilePicture: !!user?.profilePicture 
  };
}
