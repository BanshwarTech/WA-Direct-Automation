import React from 'react';
import { Check, Loader2, Lock, MoreVertical, QrCode, RefreshCw, ScanLine, Send, ServerOff, Smartphone, UserCheck } from 'lucide-react';
import { WaStatus } from '../hooks/useWaStatus';
import { useAuth } from '../auth/AuthContext';

const STEPS = [
  { icon: UserCheck, title: 'Account created', text: 'You are signed in.', state: 'done' as const },
  { icon: QrCode, title: 'Link your WhatsApp', text: 'Scan your personal QR code.', state: 'current' as const },
  { icon: Send, title: 'Send your first message', text: 'Single or bulk, from your number.', state: 'next' as const },
];

const HOW_TO = [
  { icon: Smartphone, text: <>Open <b>WhatsApp</b> on your phone</> },
  { icon: MoreVertical, text: <>Tap <b>Menu ⋮</b> (Android) or <b>Settings</b> (iPhone)</> },
  { icon: ScanLine, text: <>Choose <b>Linked devices → Link a device</b></> },
  { icon: QrCode, text: <>Point your phone at the QR code</> },
];

// Shown on Send Messages until the signed-in user links their WhatsApp
export const LinkOnboarding: React.FC<{ waStatus: WaStatus | null }> = ({ waStatus }) => {
  const { user } = useAuth();
  const firstName = user?.name.split(/\s+/)[0] ?? 'there';
  const offline = waStatus === null;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(10,31,51,0.04),0_24px_60px_-28px_rgba(10,31,51,0.3)]">
      <div className="grid lg:grid-cols-[1.1fr_1fr]">
        {/* Left: welcome, progress and instructions */}
        <div className="space-y-8 p-7 md:p-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Almost there
            </span>
            <h2 className="text-2xl font-black tracking-tight text-navy-900 md:text-3xl">Welcome, {firstName} 👋</h2>
            <p className="text-slate-500">One last step: link your WhatsApp. Messages will go out from your own number.</p>
          </div>

          {/* Progress */}
          <ol className="grid gap-3 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className={`relative rounded-2xl border p-4 ${
                  s.state === 'current' ? 'border-green-300 bg-green-50/60 ring-4 ring-green-500/10' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      s.state === 'done'
                        ? 'bg-green-600 text-white'
                        : s.state === 'current'
                          ? 'bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-md shadow-green-600/30'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {s.state === 'done' ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-400">0{i + 1}</span>
                </div>
                <div className={`mt-3 text-sm font-bold ${s.state === 'next' ? 'text-slate-500' : 'text-navy-900'}`}>{s.title}</div>
                <div className="text-xs text-slate-500">{s.text}</div>
              </li>
            ))}
          </ol>

          {/* How to scan */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">How to scan</h3>
            <ol className="mt-3 space-y-2.5">
              {HOW_TO.map((h, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <h.icon className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>{h.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right: QR stage */}
        <div className="relative flex flex-col items-center justify-center gap-6 overflow-hidden bg-navy-950 p-8 md:p-10">
          <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-wa/25 blur-3xl" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black,transparent)]"
          />

          <div className="relative">
            {/* scanner corner brackets */}
            {['left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl', 'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-2xl', 'right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl'].map((c) => (
              <span key={c} aria-hidden className={`absolute h-10 w-10 border-wa ${c}`} />
            ))}
            <div className="relative m-4 flex h-[248px] w-[248px] items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-2xl">
              {offline ? (
                <div className="flex flex-col items-center gap-2 px-6 text-center text-sm text-slate-600">
                  <ServerOff className="h-8 w-8 text-red-500" />
                  Server not reachable. Run <code className="font-mono">npm run dev</code> and refresh.
                </div>
              ) : waStatus?.qr ? (
                <>
                  <img src={waStatus.qr} alt="Your WhatsApp link QR code" className="h-full w-full" />
                  <span aria-hidden className="absolute inset-x-3 top-3 h-0.5 animate-scan-lg rounded-full bg-wa shadow-[0_0_14px_3px_rgba(37,211,102,0.7)]" />
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  Generating your QR code…
                </div>
              )}
            </div>
          </div>

          <div className="relative space-y-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white">
              {offline ? (
                <span className="h-2 w-2 rounded-full bg-red-500" />
              ) : (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                </span>
              )}
              {offline ? 'Server offline' : 'Waiting for you to scan…'}
            </div>
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <RefreshCw className="h-3 w-3" /> The code refreshes automatically
              <span className="mx-1 text-slate-600">·</span>
              <Lock className="h-3 w-3" /> Private to your account
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
