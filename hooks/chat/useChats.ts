import { ChatService } from "@services/chat/chatService";
import { ChatPreview } from "@services/chat/types";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../general/useAuth";
import { useRealtime } from "../general/useRealtime";

/**
 * Dedicated hook to fetch and subscribe to the user's active chats.
 * This abstracts the logic away from the UI component.
 */
export const useChats = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    if (!user) {
      console.warn("[useChats] Fetch skipped: No authenticated user found.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Fetch user's direct chats
      const userChats = await ChatService.getChats(user.userId);

      // Admin can see all city chats
      let allChats = [...userChats];
      if (user.role === "ADMIN") {
        const cityChats = await ChatService.getAllCityChats();
        // Merge and remove duplicates
        const userChatIds = new Set(userChats.map(c => c.id));
        const uniqueCityChats = cityChats.filter(c => !userChatIds.has(c.id));
        allChats = [...allChats, ...uniqueCityChats];
      }

      setChats(allChats);
      console.log(`[useChats] Fetched ${allChats.length} chats for user ${user.userId}`);
    } catch (err: any) {
      console.error("[useChats] Error fetching chats:", err);
      setError(err.message || "Failed to load chats.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Subscribe to real-time updates for the user's chats
  useRealtime("chat_participants", {
    filter: { column: "participant_id", value: user?.userId! },
    onInsert: fetchChats,
    onUpdate: fetchChats,
    onDelete: fetchChats,
    enabled: !!user && user.approvalStatus === "APPROVED",
  });

  return {
    chats,
    isLoading,
    error,
    refetch: fetchChats,
  };
}
