import { useAuth } from "@context/AuthContext";
import { supabase } from "@lib/supabase";
import { getCityChatSenderProfile } from "@services/cityChat/cityChatController";
import {
  fetchAndMapCityChatMessages,
  fetchAndMapConversationMessages,
  mapCityChatMessage,
  mapConversationMessage,
  MappedChatMessage,
} from "@utils/mapMessages";
import {
  subscribeToCityChatMessages,
  subscribeToConversationMessages,
} from "@utils/realtime";
import { useEffect, useState } from "react";

export type ChatSource = "PRIVATE" | "CITY";

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
  useEffect(() => {
    if (!chatId) return;

    const onNewMessage = (raw: any) => {
      const mappedMessage =
        source === "PRIVATE"
          ? mapConversationMessage(raw)
          : mapCityChatMessage(raw);

      setMessages((prev) => {
        if (prev.find((m) => m.id === mappedMessage.id)) return prev;
        return [...prev, mappedMessage];
      });

      // Special case for City Chats: Fetch sender profile if missing
      if (
        source === "CITY" &&
        mappedMessage.senderId !== user?.userId &&
        (!mappedMessage.senderName || !mappedMessage.senderProfilePicture)
      ) {
        void getCityChatSenderProfile({
          senderId: mappedMessage.senderId,
        }).then((profileResult) => {
          if (!profileResult.success || !profileResult.data) return;

          const profile = profileResult.data;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === mappedMessage.id
                ? {
                  ...msg,
                  senderName:
                    [profile.firstName, profile.lastName]
                      .filter(Boolean)
                      .join(" ") || "Consultant",
                  senderProfilePicture: profile.profilePicture,
                }
                : msg
            )
          );
        });
      }
    };

    const channel =
      source === "PRIVATE"
        ? subscribeToConversationMessages(String(chatId), onNewMessage)
        : subscribeToCityChatMessages(Number(chatId), onNewMessage);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, source, user?.userId]);

  return { messages, loading, setMessages };
}
