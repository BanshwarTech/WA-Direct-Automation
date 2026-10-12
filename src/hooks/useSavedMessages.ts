import { useCallback, useEffect, useState } from 'react';

export interface SavedMessage {
  id: string;
  title: string;
  text: string;
  source: 'ai' | 'manual';
  /** false = AI history entry (the server keeps only the latest 20) */
  pinned?: boolean;
  createdAt: string;
}

export const isPinned = (m: SavedMessage) => m.pinned !== false;

const jsonHeaders = { 'Content-Type': 'application/json' };

// The logged-in user's message library (stored on the server with their account):
// saved messages plus the auto-trimmed AI Composer history
export function useSavedMessages(enabled: boolean) {
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  useEffect(() => {
    if (!enabled) return setMessages([]);
    fetch('/api/messages')
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => {});
  }, [enabled]);

  const save = useCallback(
    async (text: string, source: SavedMessage['source'], opts: { title?: string; pin?: boolean } = {}) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ text, source, title: opts.title ?? '', pin: opts.pin ?? true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) throw new Error('Your session has expired. Log in again to save messages.');
        if (res.status === 404) throw new Error('The server is out of date. Restart it (npm run dev) and try again.');
        throw new Error(data.error || `Could not save the message (error ${res.status}).`);
      }
      if (Array.isArray(data.messages)) setMessages(data.messages);
      return data.message as SavedMessage;
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    setMessages((list) => list.filter((m) => m.id !== id));
    await fetch(`/api/messages/${id}`, { method: 'DELETE', headers: jsonHeaders, body: '{}' }).catch(() => {});
  }, []);

  return { messages, save, remove };
}
