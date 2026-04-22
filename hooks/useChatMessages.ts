import { useAuth } from "@hooks/useAuth";
import { useRealtime } from "@hooks/useRealtime";
import { getMessages } from "@services/chat/chatController";
import { getCityChatMessages, getCityChatSenderProfile } from "@services/cityChat/cityChatController";
import {
  mapChatMessage,
  mapCityChatMessage,
  MappedChatMessage,
} from "@utils/chatMapping";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

export type ChatSource = "PRIVATE" | "CITY";

export type DecoratedChatMessage = MappedChatMessage & {
  showDateSeparator: boolean;
  isPreviousFromSameSender: boolean;
};

/**
 * Hook to manage chat messages for a specific chat or city chat.
 * @param chatId The ID of the chat to fetch messages for.
 * @param source The source of the chat (PRIVATE or CITY).
 * @returns An object containing the messages, loading state, and message setter.
 */
export function useChatMessages(chatId: string | number, source: ChatSource) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MappedChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);

      let isCurrent = true;

      const loadData = async () => {
        if (!chatId || !user?.userId) return;

        setLoading(true);
        try {
          const fetchResult =
            source === "PRIVATE"
              ? await getMessages({
                chatId: String(chatId),
              })
              : await getCityChatMessages({
                cityChatId: Number(chatId),
              });

          if (isCurrent && fetchResult.success && fetchResult.data) {
            if (source === "PRIVATE") {
              setMessages(fetchResult.data.map((message) => mapChatMessage(message as any)));
            } else {
              setMessages(fetchResult.data.map((message) => mapCityChatMessage(message as any)));
            }
          }
        } catch (error) {
          console.error("Failed to load chat messages:", error);
        } finally {
          if (isCurrent) {
            setLoading(false);
          }
        }
      };

      void loadData();

      return () => {
        isCurrent = false;
        setIsActive(false);
      };
    }, [chatId, source, user?.userId])
  );

  // -- Real-time Subscription --
  const onNewMessage = async (raw: any) => {
  let senderInfo = null;

  if (source === "CITY" && raw.sender_id !== user?.userId) {
    const profileResult = await getCityChatSenderProfile({ senderId: raw.sender_id });
    if (profileResult.success && profileResult.data) {
      senderInfo = profileResult.data;
    }
  }

  const mappedMessage =
    source === "PRIVATE"
      ? mapChatMessage(raw)
      : mapCityChatMessage({ ...raw, sender: senderInfo });

  setMessages((prev) => {
    if (prev.find((m) => m.id === mappedMessage.id)) return prev;
    return [...prev, mappedMessage];
  });
};
  useRealtime<any>(
    "Messages",
    {
      filter: {
        column: source === "PRIVATE" ? "conversation_id" : "city_chat_id",
        value: chatId,
      },
      onInsert: onNewMessage,
      enabled: isActive,
    }
  );

  const decoratedMessages = useMemo(() => {
    return messages.map((msg, index) => {
      const previous = messages[index - 1];
      const showDateSeparator =
        !previous ||
        new Date(msg.createdAt).toDateString() !==
        new Date(previous.createdAt).toDateString();

      const isPreviousFromSameSender = previous?.sender_id === msg.sender_id;

      return {
        ...msg,
        showDateSeparator,
        isPreviousFromSameSender,
      };
    });
  }, [messages]);

  return { messages: decoratedMessages, loading, setMessages };
}
