import React from 'react';
import { ArrowRight, Lock, MessageCircle, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { btnPrimary } from './ui';

const TRUST = [
  { icon: Zap, label: 'Set up in 1 minute' },
  { icon: Lock, label: 'Your own number' },
  { icon: ShieldCheck, label: 'No Meta account' },
];

// Closing call to action on the home page: compact banner, text on the left and actions on the right
export const HomeCta: React.FC = () => {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden rounded-3xl bg-navy-900 px-6 py-9 shadow-[0_24px_60px_-30px_rgba(10,31,51,0.7)] ring-1 ring-inset ring-white/10 md:px-10 md:py-11">
      {/* Grid texture + glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_right,transparent,black_40%,black_60%,transparent)]"
      />
      <div aria-hidden className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-wa/20 blur-[90px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 right-10 h-64 w-80 rounded-full bg-emerald-400/15 blur-[90px]" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-wa to-emerald-600 text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.7)]">
            <MessageCircle className="h-8 w-8" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-wa opacity-60" />
              <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-navy-900 bg-wa" />
            </span>
          </span>

          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                Ready to send your first{' '}
                <span className="bg-gradient-to-r from-wa to-emerald-300 bg-clip-text text-transparent">WhatsApp</span> message?
              </h2>
              <p className="text-sm text-slate-300 md:text-base">Link once, then reach one customer or your whole list from the browser.</p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {TRUST.map((t) => (
                <li
                  key={t.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200"
                >
                  <t.icon className="h-3.5 w-3.5 text-wa" /> {t.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <a href={user ? '/send' : '/register'} className={`${btnPrimary} group`}>
            {user ? 'Open Send Messages' : 'Get started free'}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </a>
          <a
            href="/help"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
          >
            Help Center
          </a>
        </div>
      </div>
    </section>
  );
};
