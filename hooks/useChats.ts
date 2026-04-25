import { ChatService } from "@services/chat/chatService";
import { ChatPreview } from "@services/chat/types";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useRealtime } from "./useRealtime";

/**
 * useChats
 * Dedicated hook to fetch and subscribe to the user's active chats.
 * This abstracts the logic away from the UI component.
 */
export const useChats = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    try {
      // Fetch user's direct chats
      const userChats = await ChatService.getChats(user.userId);

      // Admin can see all city chats
      let allChats = [...userChats];
      if (user.role === "ADMIN") {
        const cityChats = await ChatService.getAllCityChats();
        // Merge and remove duplicates (some city chats might already be in userChats)
        const userChatIds = new Set(userChats.map(c => c.id));
        const uniqueCityChats = cityChats.filter(c => !userChatIds.has(c.id));
        allChats = [...allChats, ...uniqueCityChats];
      }

      setChats(allChats);
    } catch (err: any) {
      setError(err.message || "Failed to load chats.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Top-level hook call — subscribes to real-time updates for new/changed chats
  useRealtime("chat_participants", {
    onInsert: fetchChats,
    onUpdate: fetchChats,
    onDelete: fetchChats,
    enabled: !!user,
  });

  return {
    chats,
    isLoading,
    error,
    refetch: fetchChats,
  };
}