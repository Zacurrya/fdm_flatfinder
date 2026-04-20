import { supabase } from "@lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Subscribes to new Postgres inserts on a specified table given a filter string.
 * This abstracts away the boilerplate of the Supabase Realtime Channels API.
 * 
 * @param tableName The table to listen to (e.g., 'Messages', 'CityChatMessages')
 * @param filterString The eq filter (e.g., 'conversation_id=eq.123')
 * @param channelName Unique label for this channel connection instance
 * @param onNewMessage Callback invoked whenever a new row is inserted
 * @returns The active RealtimeChannel
 */
export function subscribeToTableMessages<T>(
  tableName: string,
  filterString: string,
  channelName: string,
  onNewMessage: (message: T) => void
): RealtimeChannel {
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: tableName,
        filter: filterString,
      },
      (payload) => {
        onNewMessage(payload.new as T);
      }
    )
    .subscribe();

  return channel;
}


// Subscribes to new messages in a 1-to-1 Conversation.
export function subscribeToConversationMessages(
  conversationId: string,
  onNewMessage: (message: Record<string, unknown>) => void
): RealtimeChannel {
  return subscribeToTableMessages(
    "Messages",
    `conversation_id=eq.${conversationId}`,
    `messages:${conversationId}`,
    onNewMessage
  );
}

// Subscribes to new messages in a City Group Chat.
export function subscribeToCityChatMessages(
  cityChatId: number,
  onNewMessage: (message: Record<string, unknown>) => void
): RealtimeChannel {
  return subscribeToTableMessages(
    "CityChatMessages",
    `CityChatId=eq.${cityChatId}`,
    `city-chat:${cityChatId}`,
    onNewMessage
  );
}
