import { MessageRecord } from "@/types/records";
import { useAuth } from "@hooks/general/useAuth";
import { useRealtime } from "@hooks/general/useRealtime";
import { ChatService } from "@services/chat/chatService";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

/**
 * useChatMessages
 * Hook to manage chat messages for a specific chat.
 * Subscribes to real-time updates to ensure the UI is always current.
 */
export const useChatMessages = (chatId: string) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<MessageRecord[]>([]);

  const fetchMessages = useCallback(async () => {
    if (!chatId || !user?.userId) return;

    setIsLoading(true);
    try {
      const data = await ChatService.getMessages({ chatId });
      setMessages(data);
    } catch (error) {
      console.error("[useChatMessages] Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chatId, user?.userId]);

  // Handle new incoming messages via Realtime
  const handleNewMessage = useCallback((payload: any) => {
    const newMessage: MessageRecord = {
      id: payload.id,
      chatId: payload.chat_id,
      senderId: payload.sender_id,
      content: payload.content,
      createdAt: payload.created_at,
    };

    setMessages((prev) => {
      // Avoid duplicates if fetch and realtime collide
      if (prev.some(m => m.id === newMessage.id)) return prev;
      return [...prev, newMessage];
    });
  }, []);

  // Subscribe to real-time updates for the messages table
  useRealtime<any>("messages", {
    onInsert: handleNewMessage,
    enabled: !!chatId,
    filter: { column: "chat_id", value: chatId }
  });

  // Fetch messages when focused on chat screen
  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [fetchMessages])
  );

  return {
    messages,
    isLoading,
    refetch: fetchMessages,
  };
}
