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
      const data = await ChatService.getChats(user.userId);
      setChats(data);
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