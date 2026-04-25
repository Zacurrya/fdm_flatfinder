import { User } from "@services/auth/types";
import { UserService } from "@services/user/userService";
import { useEffect, useState } from "react";
import { useProfilePicture } from "./useProfilePicture";

const userCache = new Map<string, User>();
const pendingUserRequests = new Map<string, Promise<User>>(); // Store promises to prevent request racing

/**
 * Fetches and caches user profiles.
 */
export const useUserDetails = (userId: string | null | undefined) => {
  const [userDetails, setUserDetails] = useState<User | null>(userCache.get(userId ?? "") ?? null);
  const [isLoading, setIsLoading] = useState(!userCache.has(userId ?? ""));

  const { avatarUrl, hasProfilePicture, isLoading: avatarLoading } = useProfilePicture(userId);

  useEffect(() => {
    if (!userId) {
      setUserDetails(null);
      setIsLoading(false);
      return;
    }

    // Check Cache immediately
    const cached = userCache.get(userId);
    if (cached) {
      setUserDetails(cached);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadUser = async () => {
      // Checks if there is already a request in progress for the userId
      let promise = pendingUserRequests.get(userId);

      if (!promise) {
        // Create the promise if it doesn't exist
        promise = (async () => {
          try {
            const data = await UserService.getUserProfile(userId);
            userCache.set(userId, data);
            return data;
          } catch (error) {
            pendingUserRequests.delete(userId); // Clear failed promise so we can retry later
            throw error;
          } finally {
            pendingUserRequests.delete(userId);
          }
        })();

        pendingUserRequests.set(userId, promise);
      }

      try {
        setIsLoading(true);
        const data = await promise;
        if (isMounted) {
          setUserDetails(data);
        }
      } catch (error) {
        if (isMounted) {
          console.error(`[useUserDetails] Failed for ${userId}:`, error);
          setUserDetails(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return {
    userDetails,
    avatarUrl,
    hasProfilePicture,
    isLoading: isLoading || avatarLoading,
  };
}