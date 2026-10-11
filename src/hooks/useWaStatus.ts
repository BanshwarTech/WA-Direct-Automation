import { useEffect, useState } from 'react';

export interface WaStatus {
  ready: boolean;
  qr: string | null;
  user: string | null;
}

// Polls the server-side WhatsApp link status. null means the server is unreachable.
export function useWaStatus(enabled: boolean, intervalMs = 3000): WaStatus | null {
  const [status, setStatus] = useState<WaStatus | null>(null);

  useEffect(() => {
    if (!enabled) {
      setStatus(null);
      return;
    }
    let alive = true;
    const load = () =>
      fetch('/api/wa/status')
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((s: WaStatus) => alive && setStatus(s))
        .catch(() => alive && setStatus(null));
    load();
    const timer = setInterval(load, intervalMs);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [enabled, intervalMs]);

  return status;
}
