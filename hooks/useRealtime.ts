import { supabase } from "@lib/supabase";
import { useEffect, useRef } from "react";

/**
 * useRealtime Hook
 * Subscribes to Supabase Postgres changes.
 * Handles subscription lifecycle (mount/unmount).
 * 
 * @param tableName Name of the table to listen to.
 * @param filter Optional filter configuration.
 * @param onInsert Callback for new record inserts.
 */
export function useRealtime<T>(
  tableName: string,
  filter?: { column: string; value: string | number },
  onInsert?: (record: T) => void
) {
  // Use a ref for the callback to prevent unnecessary subscription cycles if the handler is not memoized
  const onInsertRef = useRef(onInsert);
  onInsertRef.current = onInsert;

  useEffect(() => {
    // If a filter is specified but the value is missing, wait (guard against undefined IDs)
    if (filter && (!filter.value || filter.value === "undefined")) return;

    const filterString = filter ? `${filter.column}=eq.${filter.value}` : "";
    const channelName = `${tableName}:${filter?.column ?? "all"}:${filter?.value ?? "global"}`;

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
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [tableName, filter?.column, filter?.value]);
}
