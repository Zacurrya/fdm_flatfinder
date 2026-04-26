import { useQuery } from "@tanstack/react-query";
import { UserService } from "@services/user/userService";
import { useProfilePicture } from "./useProfilePicture";

/**
 * useUserDetails
 * 
 * Fetches and caches user profiles using TanStack Query.
 */
export const useUserDetails = (userId: string | null | undefined) => {
  const { data: userDetails, isLoading: userLoading } = useQuery({
    queryKey: UserService.queryKeys.user(userId || ""),
    queryFn: () => UserService.getUserRecord(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const { avatarUrl, isLoading: avatarLoading } = useProfilePicture(userId);

  return {
    userDetails,
    avatarUrl,
    isLoading: userLoading || avatarLoading,
  };
}
