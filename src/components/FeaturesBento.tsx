import React from 'react';
import { ArrowRight, Bot, Check, Code2, Loader2, Send, Smartphone, Sparkles, Users } from 'lucide-react';
import { btnPrimarySm } from './ui';

interface CardProps {
  href: string;
  icon: React.ElementType;
  index: string;
  title: string;
  text: string;
  cta: string;
  className?: string;
  children: React.ReactNode;
}

// Shared card shell: gradient icon tile, copy, CTA, and a mini product preview
const FeatureCard: React.FC<CardProps> = ({ href, icon: Icon, index, title, text, cta, className = '', children }) => (
  <a
    href={href}
    className={`group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(10,31,51,0.04),0_8px_24px_-12px_rgba(10,31,51,0.12)] transition duration-300 hover:-translate-y-1 hover:border-green-300 hover:shadow-[0_20px_50px_-20px_rgba(22,163,74,0.35)] ${className}`}
  >
    {/* soft glow that appears on hover */}
    <div
      aria-hidden
      className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-wa/20 opacity-0 blur-3xl transition duration-500 group-hover:opacity-100"
    />
    <div className="relative flex items-start justify-between">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-lg shadow-green-600/30">
        <Icon className="h-6 w-6" />
      </span>
      <span className="font-mono text-xs font-semibold tracking-widest text-slate-300">{index}</span>
    </div>
    <h3 className="relative mt-5 text-lg font-bold text-navy-900">{title}</h3>
    <p className="relative mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
    <div className="relative mt-6 flex flex-1 flex-col justify-center">{children}</div>
    <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
      {cta}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </span>
  </a>
);

const DirectPreview = () => (
  <div className="grid gap-4 sm:grid-cols-2">
    <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">+91 98765 43210</div>
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-700">
        Hi Priya, your appointment is confirmed for 4 PM tomorrow.
      </div>
      <div className="flex justify-end">
        <span className={btnPrimarySm}>
          <Send className="h-3 w-3" /> Send
        </span>
      </div>
    </div>
    <div className="flex flex-col justify-end rounded-2xl bg-[#efeae2] p-4">
      <div className="ml-auto max-w-[90%] rounded-xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2 text-xs leading-relaxed text-navy-900 shadow-sm">
        Hi Priya, your appointment is confirmed for 4 PM tomorrow.
        <div className="mt-0.5 text-right text-[10px] text-slate-500">
          now <span className="text-sky-500">✓✓</span>
        </div>
      </div>
    </div>
  </div>
);

const BulkPreview = () => {
  const rows = [
    { name: 'Rahul', status: 'sent' },
    { name: 'Priya', status: 'sent' },
    { name: 'Amit', status: 'sending' },
    { name: 'Neha', status: 'queued' },
  ];
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
        <span>Queue · 2 of 4 sent</span>
        <span>3–8s gap</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-green-500 to-wa" />
      </div>
      <ul className="space-y-1.5">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-xs">
            <span className="flex items-center gap-2 text-slate-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-800 text-[9px] font-bold text-white">
                {r.name[0]}
              </span>
              {r.name}
            </span>
            {r.status === 'sent' && <Check className="h-3.5 w-3.5 text-green-600" />}
            {r.status === 'sending' && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
            {r.status === 'queued' && <span className="text-[10px] text-slate-400">queued</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

const AiPreview = () => (
  <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex flex-wrap gap-1.5">
      {['Payment reminder', 'Hinglish', 'Polite'].map((t) => (
        <span key={t} className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
          {t}
        </span>
      ))}
    </div>
    <div className="rounded-xl border border-green-200 bg-white p-3 text-xs leading-relaxed text-slate-700">
      <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-green-700">
        <Sparkles className="h-3 w-3" /> AI draft
      </div>
      Namaste <b>Rahul ji</b> 🙏 Aapka invoice pending hai. Kripya convenience par payment kar dijiye. Thank you!
    </div>
  </div>
);

const ScriptsPreview = () => (
  <div className="grid gap-4 sm:grid-cols-5">
    <div className="sm:col-span-2 flex flex-wrap content-start gap-2">
      {['AI Auto-Reply Bot', 'Android ADB', 'Python', 'Termux', 'cURL'].map((t, i) => (
        <span
          key={t}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            i === 0 ? 'bg-green-600 text-white' : 'border border-slate-200 bg-white text-slate-600'
          }`}
        >
          {t}
        </span>
      ))}
    </div>
    <pre className="sm:col-span-3 overflow-hidden rounded-2xl bg-[#0d1117] p-4 font-mono text-[11px] leading-relaxed text-slate-300">
      <span className="text-slate-500">$</span> curl -X POST localhost:3000/api/wa/send \{'\n'}
      {'  '}-d <span className="text-emerald-300">'{'{'}"phone":"91…","message":"Hi!"{'}'}'</span>
      {'\n\n'}
      <span className="text-emerald-400">{'{'} "success": true {'}'}</span>
    </pre>
  </div>
);

export const FeaturesBento: React.FC = () => (
  <section className="relative space-y-12">
    <div className="mx-auto max-w-2xl text-center space-y-4">
      <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-green-700 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-wa" /> Powerful Features
      </span>
      <h2 className="text-3xl md:text-5xl font-black tracking-tight text-navy-900">
        Everything in{' '}
        <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">one place</span>
      </h2>
      <p className="text-base md:text-lg text-slate-500">
        From a single message to a full campaign, every tool you need runs from your own computer.
      </p>
    </div>

    <div className="grid gap-6 lg:grid-cols-6">
      <FeatureCard
        className="lg:col-span-4"
        href="/send"
        icon={Smartphone}
        index="01"
        title="Direct Messaging"
        text="Send to any WhatsApp number without saving it as a contact. Type, click Send, and it is delivered from your own number."
        cta="Send a message"
      >
        <DirectPreview />
      </FeatureCard>

      <FeatureCard
        className="lg:col-span-2"
        href="/send"
        icon={Users}
        index="02"
        title="Bulk Sending"
        text="Personalise with {name} and send to a whole list with safe random delays."
        cta="Open bulk queue"
      >
        <BulkPreview />
      </FeatureCard>

      <FeatureCard
        className="lg:col-span-2"
        href="/ai"
        icon={Bot}
        index="03"
        title="AI Composer"
        text="Polished messages in English, Hindi, or Hinglish, written by NVIDIA NIM models."
        cta="Try the composer"
      >
        <AiPreview />
      </FeatureCard>

      <FeatureCard
        className="lg:col-span-4"
        href="/scripts"
        icon={Code2}
        index="04"
        title="Automation Scripts & API"
        text="Download ready-made scripts for an AI auto-reply bot, Android, or Python, or send from your own software with a single HTTP call."
        cta="Browse scripts"
      >
        <ScriptsPreview />
      </FeatureCard>
    </div>
  </section>
);
