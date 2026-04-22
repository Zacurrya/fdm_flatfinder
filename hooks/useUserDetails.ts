import { User } from "@services/auth/types";
import { getUserProfile } from "@services/user/userController";
import { useEffect, useState } from "react";

const userCache = new Map<string, User>(); // Cache user details by userId
const pendingUserRequests = new Map<string, Promise<User>>(); // Store promises to prevent request racing

export function useUserDetails(userId: string | null | undefined) {
  const [userDetails, setUserDetails] = useState<User | null>(userCache.get(userId ?? "") ?? null);
  const [loading, setLoading] = useState(!userCache.has(userId ?? ""));

  useEffect(() => {
    if (!userId) {
      setUserDetails(null);
      setLoading(false);
      return;
    }

    // Check Cache immediately
    const cached = userCache.get(userId);
    if (cached) {
      setUserDetails(cached);
      setLoading(false);
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
            const result = await getUserProfile(userId);
            if (!result.success || !result.data) {
              throw new Error(result.error ?? "Failed to load user details.");
            }
            userCache.set(userId, result.data);
            return result.data;
          } catch (error) {
            pendingUserRequests.delete(userId); // Clear failed promise so we can retry later
            throw error;
          } finally {
            // We delete from pending after a small delay or once resolved
            // to ensure simultaneous renders all catch the same promise
            pendingUserRequests.delete(userId);
          }
        })();
        
        pendingUserRequests.set(userId, promise);
      }

      try {
        setLoading(true);
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
        if (isMounted) setLoading(false);
      }
    };

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return {
    userDetails,
    profilePicture: userDetails?.profilePicture ?? null,
    loading,
  };
}