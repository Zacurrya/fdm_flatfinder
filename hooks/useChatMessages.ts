import { useAuth } from "@context/AuthContext";
import { getCityChatSenderProfile } from "@services/cityChat/cityChatController";
import {
  fetchAndMapCityChatMessages,
  fetchAndMapConversationMessages,
  mapCityChatMessage,
  mapConversationMessage,
  MappedChatMessage,
} from "@utils/chatMapping";
import { useRealtime } from "@hooks/useRealtime";
import { useCallback, useEffect, useMemo, useState } from "react";

export type ChatSource = "PRIVATE" | "CITY";

export type DecoratedChatMessage = MappedChatMessage & {
  showDateSeparator: boolean;
  isPreviousFromSameSender: boolean;
};

export function useChatMessages(chatId: string | number, source: ChatSource) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MappedChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // -- Load Initial Messages --
  useEffect(() => {
    if (!chatId || !user?.userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const result =
          source === "PRIVATE"
            ? await fetchAndMapConversationMessages({
              conversationId: String(chatId),
            })
            : await fetchAndMapCityChatMessages({
              cityChatId: Number(chatId),
            });

        if (result.success && result.data) {
          setMessages(result.data);
        }
      } catch (error) {
        console.error("Failed to load chat messages:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [chatId, source, user?.userId]);

  // -- Real-time Subscription --
  const onNewMessage = useCallback(
    async (raw: any) => {
      let senderInfo = null;

      // If it's a City Chat and from someone else, fetch their profile first
      if (source === "CITY" && raw.sender_id !== user?.userId) {
        const profileResult = await getCityChatSenderProfile({
          senderId: raw.sender_id,
        });
        if (profileResult.success && profileResult.data) {
          senderInfo = profileResult.data;
        }
      }

      const mappedMessage =
        source === "PRIVATE"
          ? mapConversationMessage(raw)
          : mapCityChatMessage({
              ...raw,
              sender: senderInfo,
            });

      setMessages((prev) => {
        if (prev.find((m) => m.id === mappedMessage.id)) return prev;
        return [...prev, mappedMessage];
      });
    },
    [source, user?.userId]
  );

  useRealtime<any>(
    "Messages",
    {
      column: source === "PRIVATE" ? "conversation_id" : "city_chat_id",
      value: chatId,
    },
    onNewMessage
  );

  const decoratedMessages = useMemo(() => {
    return messages.map((msg, index) => {
      const previous = messages[index - 1];
      const showDateSeparator =
        !previous ||
        new Date(msg.createdAt).toDateString() !==
        new Date(previous.createdAt).toDateString();

      const isPreviousFromSameSender = previous?.senderId === msg.senderId;

      return {
        ...msg,
        showDateSeparator,
        isPreviousFromSameSender,
      };
    });
  }, [messages]);

  return { messages: decoratedMessages, loading, setMessages };
}
