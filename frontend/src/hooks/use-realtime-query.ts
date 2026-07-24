import { useQuery, useQueryClient, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * A custom hook that wraps React Query's useQuery and adds automatic 
 * Supabase Realtime subscriptions to invalidate the query when data changes.
 * 
 * @param options - Standard React Query options (must include queryKey and queryFn)
 * @param tables - Array of Supabase table names to monitor for changes
 */
export function useRealtimeQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
  options: UseQueryOptions<TQueryFnData, TError, TData>,
  tables: string[]
): UseQueryResult<TData, TError> {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);

  // Setup React Query with dynamic refetch interval fallback
  const query = useQuery({
    ...options,
    // Fall back to polling every 10s if realtime disconnects or errors
    refetchInterval: (query) => {
      // If user explicitly provided a refetch interval, respect it
      if (options.refetchInterval !== undefined) {
        return typeof options.refetchInterval === 'function' 
          ? options.refetchInterval(query) 
          : options.refetchInterval;
      }
      // Otherwise fallback if realtime is down
      return isRealtimeActive ? false : 10000;
    },
  });

  useEffect(() => {
    // We can't monitor if no tables are provided
    if (!tables || tables.length === 0) return;

    let channels: ReturnType<typeof supabase.channel>[] = [];
    
    tables.forEach((table) => {
      const channelId = `realtime:${table}:${Math.random().toString(36).substring(7)}`
      const channel = supabase
        .channel(channelId)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          () => {
            // Silently invalidate the query to trigger a background refetch
            // This does NOT set isLoading to true, preserving the UI state without flickering
            queryClient.invalidateQueries({ queryKey: options.queryKey });
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsRealtimeActive(true);
          } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
            // Gracefully fall back to polling if the connection drops
            setIsRealtimeActive(false);
          }
        });
        
      channels.push(channel);
    });

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [tables.join(","), options.queryKey, queryClient, supabase]);

  return query;
}
