import { supabase } from "@lib/supabase";
import { logger } from "@utils/logger";
import { useEffect, useRef } from "react";

/**
 * useRealtime
 * Subscribes to table INSERT, UPDATE and DELETE changes.
 * Handles subscription lifecycle (mount/unmount).
 * 
 * @param tableName Name of the table to listen to.
 * @param filter Optional filter configuration.
 * @param onInsert Callback for new record inserts.
 * @param onUpdate Callback for record updates.
 * @param onDelete Callback for record deletes.
 * @param enabled Whether the subscription should currently be active.
 */
export function useRealtime<T>(
  tableName: string,
  options: {
    filter?: { column: string; value: string | number },
    onInsert?: (record: T) => void,
    onUpdate?: (record: T) => void,
    onDelete?: (record: T) => void,
    enabled?: boolean
  } = {}
) 
  {
  // Use a ref for the callback to prevent unnecessary subscription cycles if the handler is not memoized
  const onInsertRef = useRef(options.onInsert);
  const onUpdateRef = useRef(options.onUpdate);
  const onDeleteRef = useRef(options.onDelete);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const instanceIdRef = useRef(Math.random().toString(36).slice(2));

  onInsertRef.current = options.onInsert;
  onUpdateRef.current = options.onUpdate;
  onDeleteRef.current = options.onDelete;

  const filterColumn = options.filter?.column;
  const filterValue = options.filter?.value;

  useEffect(() => {
    if (!options.enabled) return;

    // If a filter is specified but the value is missing, wait (guard against undefined IDs)
    if (filterColumn && (filterValue == null || filterValue === "undefined")) return;

    const filterString = filterColumn ? `${filterColumn}=eq.${filterValue}` : "";
    const channelName = `${tableName}:${filterColumn ?? "all"}:${filterValue ?? "global"}:${instanceIdRef.current}`;
    
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
          onInsertRef.current?.(payload.new as T);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: tableName,
          filter: filterString,
        },
        (payload) => {
          onUpdateRef.current?.(payload.new as T);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: tableName,
          filter: filterString,
        },
        (payload) => {
          onDeleteRef.current?.(payload.old as T);
        }
      )
      .subscribe();
    channelRef.current = channel;
    logger.log(`Subscribed to realtime channel: ${tableName}`, { filter: filterString });

    return () => {
      const activeChannel = channelRef.current;
      channelRef.current = null;

      if (activeChannel) {
        void supabase.removeChannel(activeChannel);
        logger.log(`Unsubscribed from realtime channel: ${tableName}`, { filter: filterString });
      } else {
        logger.warn(`Trying to unsubscribe from non-existent channel: ${tableName}`, { filter: filterString });
      }
      
    };
  }, [tableName, filterColumn, filterValue, options.enabled]);
}
