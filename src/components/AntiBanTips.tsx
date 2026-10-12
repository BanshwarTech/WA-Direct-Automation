import React from 'react';
import { Eyebrow } from './Eyebrow';
import { ShieldAlert, ShieldCheck, Clock, Shuffle, UserCheck, Flame, BellOff } from 'lucide-react';

const TIPS = [
  {
    icon: Clock,
    title: 'Keep a random 3–8 second gap',
    desc: "Dozens of messages within seconds can trigger WhatsApp's spam detection. Bulk sending adds this delay for you automatically.",
  },
  {
    icon: Shuffle,
    title: 'Personalise every message',
    desc: 'Avoid identical text to hundreds of people. Use {name} and other variables so every customer gets their own details.',
  },
  {
    icon: Flame,
    title: 'Warm up new numbers',
    desc: 'On a new SIM, send 10–15 messages on day one and 25–30 on day two. A sudden spike of hundreds can get the number flagged.',
  },
  {
    icon: UserCheck,
    title: 'Message people who know you',
    desc: 'The risk drops sharply when recipients have saved your number or chatted with you before.',
  },
  {
    icon: BellOff,
    title: 'Never message strangers',
    desc: 'If several recipients tap "Report & Block", WhatsApp may suspend the account. Only message your customers and known contacts.',
  },
];

// Anti-ban guidelines: dark feature panel with five numbered rules
export const AntiBanTips: React.FC = () => (
  <div className="relative overflow-hidden rounded-3xl bg-navy-900 p-6 md:p-10">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_70%_at_0%_0%,rgba(245,158,11,0.18),transparent_70%),radial-gradient(45%_70%_at_100%_100%,rgba(37,211,102,0.16),transparent_70%)]"
    />
    <div className="relative grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="space-y-4 lg:col-span-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <Eyebrow tone="dark" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
          Stay safe
        </Eyebrow>
        <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">Anti-ban guidelines</h2>
        <p className="text-sm leading-relaxed text-slate-300">
          This app does not use the official Meta API, so WhatsApp treats your number like a regular account. Follow these five rules
          to keep it safe.
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
        {TIPS.map((tip, i) => (
          <li
            key={tip.title}
            className={`group rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition hover:border-amber-400/40 hover:bg-white/[0.07] ${
              i === TIPS.length - 1 ? 'sm:col-span-2' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 transition group-hover:bg-amber-400 group-hover:text-navy-900">
                <tip.icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold tabular-nums text-slate-500">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="text-sm font-bold text-white">{tip.title}</h3>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{tip.desc}</p>
          </li>
        ))}
      </ol>
    </div>
  </div>
);
