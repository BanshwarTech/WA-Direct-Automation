import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Check, Info, X } from 'lucide-react';

// Toast notifications for one-off results (sent, saved, failed ...). Call toast.success() / toast.error() /
// toast.warning() / toast.info() from anywhere; <ToastHost /> (mounted once in App) shows them in the
// bottom-right corner, each box only as wide as its text. They close by themselves and pause while hovered.

type Tone = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  tone: Tone;
  message: React.ReactNode;
  title?: string;
  duration: number;
}

const DURATION: Record<Tone, number> = { success: 4000, info: 5000, warning: 7000, error: 7000 };

const styles: Record<Tone, { title: string; icon: React.ReactNode; badge: string; glow: string; bar: string }> = {
  success: {
    title: 'Done',
    icon: <Check className="h-3 w-3" strokeWidth={3.5} />,
    badge: 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-600/40',
    glow: 'from-green-500/10',
    bar: 'bg-gradient-to-r from-green-500 to-emerald-500',
  },
  error: {
    title: 'Something went wrong',
    icon: <X className="h-3 w-3" strokeWidth={3.5} />,
    badge: 'bg-gradient-to-br from-rose-500 to-red-600 shadow-red-600/40',
    glow: 'from-red-500/10',
    bar: 'bg-gradient-to-r from-rose-500 to-red-500',
  },
  warning: {
    title: 'Heads up',
    icon: <AlertTriangle className="h-3 w-3" strokeWidth={3} />,
    badge: 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/40',
    glow: 'from-amber-500/10',
    bar: 'bg-gradient-to-r from-amber-400 to-orange-500',
  },
  info: {
    title: 'Info',
    icon: <Info className="h-3 w-3" strokeWidth={3} />,
    badge: 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-600/40',
    glow: 'from-sky-500/10',
    bar: 'bg-gradient-to-r from-sky-500 to-blue-500',
  },
};

let push: ((t: Omit<ToastItem, 'id'>) => void) | null = null;
let nextId = 1;

const show = (tone: Tone) => (message: React.ReactNode, opts: { title?: string; duration?: number } = {}) => {
  push?.({ tone, message, title: opts.title, duration: opts.duration ?? DURATION[tone] });
};

export const toast = {
  success: show('success'),
  error: show('error'),
  warning: show('warning'),
  info: show('info'),
};

const ToastCard: React.FC<{ item: ToastItem; onClose: () => void }> = ({ item, onClose }) => {
  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const remaining = useRef(item.duration);
  const started = useRef(Date.now());
  const s = styles[item.tone];

  const close = () => {
    setLeaving(true);
    setTimeout(onClose, 200);
  };

  useEffect(() => {
    if (paused) return;
    started.current = Date.now();
    const timer = setTimeout(close, remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - started.current;
    };
  }, [paused]);

  return (
    <div
      role={item.tone === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`pointer-events-auto relative w-fit max-w-full overflow-hidden sm:max-w-[380px] rounded-xl bg-white/95 text-left shadow-[0_12px_32px_-12px_rgba(10,31,51,0.35),0_0_0_1px_rgba(10,31,51,0.06)] backdrop-blur-xl transition-all duration-200 ease-out ${
        leaving ? 'translate-x-6 opacity-0' : 'animate-toast-in'
      }`}
    >
      {/* soft tint from the icon side */}
      <span aria-hidden className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${s.glow} to-transparent to-60%`} />

      <div className="relative flex items-start gap-2.5 py-2.5 pl-3 pr-9">
        <span className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white shadow-md ${s.badge}`}>{s.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-5 text-navy-900">{item.title ?? s.title}</div>
          <div className="break-words text-xs leading-snug text-slate-600">{item.message}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={close}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-navy-900"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* time left */}
      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-100">
        <span
          className={`block h-full ${s.bar}`}
          style={{ animation: `toast-progress ${item.duration}ms linear forwards`, animationPlayState: paused ? 'paused' : 'running' }}
        />
      </span>
    </div>
  );
};

export const ToastHost: React.FC = () => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Newest at the bottom, at most 4 at a time
    push = (t) => setItems((list) => [...list, { ...t, id: nextId++ }].slice(-4));
    return () => {
      push = null;
    };
  }, []);

  if (!mounted) return null;
  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-end gap-2 px-4 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:px-0"
    >
      {items.map((item) => (
        <ToastCard key={item.id} item={item} onClose={() => setItems((list) => list.filter((t) => t.id !== item.id))} />
      ))}
    </div>,
    document.body
  );
};
