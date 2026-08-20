"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * Powers the sidebar conversation list. Replaces the hardcoded `chats`
 * array with real data from /api/conversations, refetchable after
 * creating, renaming, or deleting a conversation.
 */
export function useConversations(searchQuery = "") {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      const res = await fetch(`/api/conversations?${params}`);
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();
      setConversations(data.conversations);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { conversations, isLoading, error, refresh };
}
