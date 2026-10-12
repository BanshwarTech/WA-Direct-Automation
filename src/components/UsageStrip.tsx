import React from 'react';
import { ArrowRight, Gauge } from 'lucide-react';
import type { useBilling } from '../hooks/useBilling';

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

// Plan usage on the Send page: messages used this period, with an Upgrade link. Hidden for the admin (unlimited).
export const UsageStrip: React.FC<{ billing: ReturnType<typeof useBilling> }> = ({ billing }) => {
  const usage = billing.info?.usage;
  if (!usage || usage.unlimited) return null;

  const pct = Math.min(100, Math.round((usage.used / usage.limit) * 100));
  const left = usage.remaining ?? 0;
  const out = left === 0;
  const low = !out && pct >= 80;

  return (
    <div
      className={`mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border px-4 py-3 ${
        out ? 'border-red-200 bg-red-50/70' : low ? 'border-amber-200 bg-amber-50/70' : 'border-slate-200 bg-slate-50/70'
      }`}
    >
      <span className="flex items-center gap-2 text-sm">
        <Gauge className={`h-4 w-4 ${out ? 'text-red-600' : low ? 'text-amber-600' : 'text-green-600'}`} />
        <strong className="text-navy-900">{usage.planName} plan</strong>
      </span>

      <div className="flex min-w-[180px] flex-1 items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-inset ring-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${out ? 'bg-red-500' : low ? 'bg-amber-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="whitespace-nowrap text-xs text-slate-600">
          <strong className="text-navy-900">{usage.used.toLocaleString('en-IN')}</strong> / {usage.limit.toLocaleString('en-IN')} used
        </span>
      </div>

      <span className={`text-xs ${out ? 'font-semibold text-red-700' : 'text-slate-500'}`}>
        {out ? 'No messages left' : `${left.toLocaleString('en-IN')} left`} · {usage.planId !== 'free' && usage.source === 'prepaid' ? 'ends' : 'resets'} {fmtDate(usage.periodEnd)}
      </span>

      <a
        href="/pricing"
        className={`group inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          out || low ? 'bg-green-600 text-white hover:bg-green-700' : 'text-green-700 hover:bg-green-50'
        }`}
      >
        {usage.planId === 'pro' ? 'Manage plan' : 'Upgrade'} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </a>
    </div>
  );
};
