import React from 'react';
import {
  ArrowRight,
  Bot,
  CheckCheck,
  CheckCircle2,
  ChevronLeft,
  Mic,
  MoreVertical,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react';
import { WaStatus } from '../hooks/useWaStatus';
import { useAuth } from '../auth/AuthContext';
import { btnPrimary } from './ui';

const CHAT: { from: 'me' | 'them'; text: string; time: string }[] = [
  { from: 'them', text: 'Hi, I need help with my order.', time: '10:30 AM' },
  { from: 'me', text: 'Hello! 👋 How can we help you today?', time: '10:30 AM' },
  { from: 'them', text: 'I want to track my order.', time: '10:31 AM' },
  { from: 'me', text: 'Sure! Your order #1042 is in transit and will be delivered tomorrow. 🚚', time: '10:32 AM' },
];

const STATS = [
  { value: '₹0', label: 'per message' },
  { value: '~1 min', label: 'to set up' },
  { value: '100%', label: 'runs locally' },
];

const PhoneMockup: React.FC = () => (
  <div className="relative w-[280px] sm:w-[300px] rounded-[2.9rem] bg-gradient-to-b from-navy-700 to-navy-950 p-[10px] shadow-[0_40px_80px_-30px_rgba(10,31,51,0.55)] ring-1 ring-white/10">
    <div className="absolute left-1/2 top-[10px] z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-navy-950" />
    <div className="overflow-hidden rounded-[2.2rem] bg-[#efeae2]">
      {/* WhatsApp header */}
      <div className="flex items-center gap-2 bg-[#008069] px-3 pb-3 pt-8 text-white">
        <ChevronLeft className="h-5 w-5" />
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Smartphone className="h-4 w-4" />
        </span>
        <div className="flex-1 leading-tight">
          <div className="flex items-center gap-1 text-sm font-semibold">
            Your Business <CheckCircle2 className="h-3.5 w-3.5 fill-wa text-[#008069]" />
          </div>
          <div className="text-[11px] text-white/80">online</div>
        </div>
        <MoreVertical className="h-4 w-4" />
      </div>
      {/* Messages */}
      <div className="space-y-2.5 px-3 py-4 min-h-[340px]">
        {CHAT.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-xl px-3 py-2 text-[13px] leading-snug text-navy-900 shadow-sm ${
              m.from === 'me' ? 'ml-auto rounded-tr-sm bg-[#d9fdd3]' : 'rounded-tl-sm bg-white'
            }`}
          >
            {m.text}
            <div className="mt-0.5 text-right text-[10px] text-slate-500">
              {m.time} {m.from === 'me' && <span className="text-sky-500">✓✓</span>}
            </div>
          </div>
        ))}
        {/* typing indicator */}
        <div className="inline-flex items-center gap-1 rounded-xl rounded-tl-sm bg-white px-3 py-2.5 shadow-sm" aria-label="Customer is typing">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-typing"
              style={{ animationDelay: `${d * 0.18}s` }}
            />
          ))}
        </div>
      </div>
      {/* Input bar */}
      <div className="flex items-center gap-2 px-2 pb-3">
        <div className="flex-1 rounded-full bg-white px-4 py-2 text-xs text-slate-400 shadow-sm">Type a message</div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#008069] text-white">
          <Mic className="h-4 w-4" />
        </span>
      </div>
    </div>
  </div>
);

// Small glassy cards that float around the phone (large screens only)
const FloatCard: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <div
    className={`absolute hidden xl:flex w-60 items-center gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-[0_18px_40px_-18px_rgba(10,31,51,0.35)] backdrop-blur-md ${className}`}
  >
    {children}
  </div>
);

const IconBadge: React.FC<{ icon: React.ElementType }> = ({ icon: Icon }) => (
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-md shadow-green-600/30">
    <Icon className="h-4.5 w-4.5" />
  </span>
);

export const Hero: React.FC<{ waStatus: WaStatus | null }> = ({ waStatus }) => {
  const { user } = useAuth();
  const linked = Boolean(waStatus?.ready);
  const startHref = user ? '/send' : '/register';

  return (
    <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-white to-[#f5f8fa]">
      {/* Background: fading grid + soft brand glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(10,31,51,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,31,51,0.05)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
      />
      <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-wa/20 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-navy-600/10 blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-12 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:px-8">
        {/* Copy */}
        <div className="space-y-7">
          <a
            href="/send"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 py-1 pl-1 pr-3 text-xs font-medium text-slate-600 shadow-sm backdrop-blur hover:border-green-300"
          >
            <span className="rounded-full bg-gradient-to-r from-green-600 to-emerald-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              Free
            </span>
            No Meta account or approval required
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-green-600" />
          </a>

          <h1 className="text-[2.6rem] leading-[1.04] sm:text-6xl lg:text-[3.5rem] xl:text-[3.75rem] font-black tracking-tight text-navy-900">
            Send WhatsApp messages{' '}
            <span className="relative inline-block whitespace-nowrap">
              <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-500 bg-clip-text text-transparent">directly</span>
              <svg
                aria-hidden
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3 w-full text-wa/70"
              >
                <path d="M3 15 C 70 4, 160 2, 297 10" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>{' '}
            from your computer
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-slate-600">
            Link your WhatsApp once, then send single or bulk messages with one click. Let AI write them, or connect your
            own software through a simple API.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={startHref}
              className={`group ${btnPrimary} !px-7 !py-3.5 !text-base`}
            >
              <Send className="h-4 w-4" />
              {!user ? 'Create free account' : linked ? 'Send a Message' : 'Link your WhatsApp'}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="/ai"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 font-semibold text-navy-900 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <Bot className="h-4 w-4 text-green-600" /> Write with AI
            </a>
          </div>

          {/* Live link status from the server */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="relative flex h-2.5 w-2.5">
              {linked && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />}
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${linked ? 'bg-green-500' : waStatus ? 'bg-amber-500' : user ? 'bg-slate-300' : 'bg-green-500'}`} />
            </span>
            {!user
              ? <>Free account required. Each account links <span className="font-medium text-navy-900">its own WhatsApp</span> with a QR code.</>
              : linked
              ? <>Your WhatsApp is linked{waStatus?.user ? <> as <span className="font-medium text-navy-900">+{waStatus.user}</span></> : null}. Ready to send.</>
              : waStatus
                ? 'WhatsApp is not linked yet. It takes about a minute.'
                : 'Start the server with npm run dev to link WhatsApp.'}
          </div>

          <dl className="grid max-w-md grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white/70 py-4 shadow-sm backdrop-blur">
            {STATS.map((s) => (
              <div key={s.label} className="px-4 text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-xl font-black text-navy-900">{s.value}</dd>
                <dd className="text-xs text-slate-500">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual */}
        <div className="relative flex justify-center lg:justify-end xl:pr-12">
          <div className="relative">
            {/* glow + rings behind the phone */}
            <div aria-hidden className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-wa/25 blur-3xl" />
            <div aria-hidden className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-green-600/10" />
            <div aria-hidden className="absolute left-1/2 top-1/2 h-[660px] w-[660px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-green-600/[0.07]" />

            <div className="relative animate-float-slow">
              <PhoneMockup />
            </div>

            <FloatCard className="-left-[16rem] top-20 -rotate-3 animate-float">
              <IconBadge icon={CheckCheck} />
              <div className="leading-tight">
                <div className="text-sm font-bold text-navy-900">Message delivered</div>
                <div className="whitespace-nowrap text-xs text-slate-500">to +91 98•••43210 · now</div>
              </div>
            </FloatCard>

            <FloatCard className="-right-8 -top-20 rotate-2 animate-float-slow [animation-delay:1.2s]">
              <IconBadge icon={Sparkles} />
              <div className="leading-tight">
                <div className="text-sm font-bold text-navy-900">AI draft ready</div>
                <div className="whitespace-nowrap text-xs text-slate-500">Payment reminder · Hinglish</div>
              </div>
            </FloatCard>

            <FloatCard className="-left-[15rem] bottom-24 rotate-2 animate-float-slow [animation-delay:0.6s] flex-col !items-stretch">
              <div className="flex items-center gap-3">
                <IconBadge icon={Users} />
                <div className="leading-tight">
                  <div className="text-sm font-bold text-navy-900">Bulk queue</div>
                  <div className="whitespace-nowrap text-xs text-slate-500">48 of 50 sent · 3–8s gap</div>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-green-500 to-wa" />
              </div>
            </FloatCard>

            <FloatCard className="-right-8 -bottom-14 -rotate-2 animate-float [animation-delay:2s]">
              <IconBadge icon={ShieldCheck} />
              <div className="leading-tight">
                <div className="text-sm font-bold text-navy-900">Private & local</div>
                <div className="whitespace-nowrap text-xs text-slate-500">Runs on your own PC</div>
              </div>
            </FloatCard>
          </div>
        </div>
      </div>
    </section>
  );
};
