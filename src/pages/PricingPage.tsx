import React, { useState } from 'react';
import { Check, CreditCard, Crown, HelpCircle, Loader2, Receipt, RefreshCw, Repeat, Sparkles, Wallet } from 'lucide-react';
import { PageShell, Highlight } from '../components/PageShell';
import { Eyebrow } from '../components/Eyebrow';
import { Notice } from '../components/Notice';
import { toast } from '../components/Toast';
import { FaqAccordion } from '../components/HomeFaq';
import { confirmDialog } from '../components/Dialog';
import { useAuth } from '../auth/AuthContext';
import { useBilling } from '../hooks/useBilling';
import { formatInr, PLAN_DAYS, PLANS, Plan } from '../data/plans';

type Mode = 'once' | 'autopay';

const card = 'rounded-3xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(10,31,51,0.04),0_12px_32px_-12px_rgba(10,31,51,0.14)]';

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const PRICING_FAQS = [
  {
    q: 'What counts as a message?',
    a: 'Every message that is sent successfully: single, bulk or through the API. Failed sends (for example, a number that is not on WhatsApp) are not counted.',
  },
  {
    q: 'What happens when I run out of messages?',
    a: 'Sending pauses until your 30-day period renews or you upgrade. Your account, saved messages and WhatsApp link stay exactly as they are.',
  },
  {
    q: 'Pay once or autopay: what is the difference?',
    a: `Pay once gives you the plan for ${PLAN_DAYS} days by UPI, card or netbanking; buy again when it ends. Autopay renews the plan every month automatically through a Razorpay subscription, so you never run out.`,
  },
  {
    q: 'Can I cancel autopay?',
    a: 'Yes, anytime from this page. Your plan keeps working until the end of the period you already paid for, then you move to the Free plan. Unused messages do not carry over to the next period.',
  },
];

export const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const { info, buy, cancelAutopay } = useBilling(Boolean(user));
  const [mode, setMode] = useState<Mode>('once');
  const [busy, setBusy] = useState<string | null>(null);

  const usage = info?.usage;
  const sub = usage?.subscription;
  const autopayOn = Boolean(sub && ['active', 'authenticated'].includes(sub.status));
  const paymentsEnabled = info?.payments_enabled ?? true;

  const handleBuy = async (plan: Plan) => {
    if (!user) return;
    if (plan.id === 'free') return;
    setBusy(plan.id);
    try {
      await buy(
        plan.id,
        mode,
        { name: user.name, email: user.email, contact: user.phone ? `+${user.phone}` : '' },
        `${plan.name} plan · ${plan.messages.toLocaleString('en-IN')} messages${mode === 'autopay' ? ' · monthly autopay' : ` · ${PLAN_DAYS} days`}`
      );
      toast.success(`Payment successful. Your ${plan.name} plan is active with ${plan.messages.toLocaleString('en-IN')} messages.`);
    } catch (e: any) {
      if (e.message !== 'Payment cancelled.') toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = async () => {
    const ok = await confirmDialog({
      title: 'Turn off autopay?',
      message: usage ? `Your ${usage.planName} plan keeps working until ${fmtDate(usage.periodEnd)}. After that you move to the Free plan.` : undefined,
      confirmLabel: 'Turn off autopay',
      tone: 'danger',
    });
    if (!ok) return;
    setBusy('cancel');
    try {
      await cancelAutopay();
      toast.success('Autopay is off. You will not be charged again.');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const buttonFor = (plan: Plan) => {
    const isCurrent = usage?.planId === plan.id && !usage?.unlimited;
    const base = 'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed';
    const primary = `${base} bg-gradient-to-b from-green-500 to-green-700 text-white shadow-[0_10px_24px_-12px_rgba(22,163,74,0.8)] hover:from-green-600 hover:to-green-800 disabled:opacity-60`;
    const secondary = `${base} border border-slate-300 bg-white text-navy-900 hover:bg-slate-50 disabled:opacity-60`;
    const style = plan.popular ? primary : secondary;

    if (!user) {
      const href = plan.id === 'free' ? '/register' : '/register?next=/pricing';
      return (
        <a href={href} className={style}>
          {plan.id === 'free' ? 'Create free account' : `Get ${plan.name}`}
        </a>
      );
    }
    if (user.role === 'owner') {
      return (
        <button type="button" disabled className={secondary}>
          Not needed for admin
        </button>
      );
    }
    if (plan.id === 'free') {
      return (
        <button type="button" disabled className={secondary}>
          {isCurrent ? 'Current plan' : 'Included for everyone'}
        </button>
      );
    }
    if (isCurrent) {
      return (
        <button type="button" disabled className={secondary}>
          <Check className="h-4 w-4 text-green-600" /> Current plan
        </button>
      );
    }
    if (mode === 'autopay' && autopayOn) {
      return (
        <button type="button" disabled className={secondary} title="Turn off the current autopay first to switch plans">
          Turn off autopay to switch
        </button>
      );
    }
    return (
      <button type="button" onClick={() => handleBuy(plan)} disabled={Boolean(busy) || !paymentsEnabled} className={style}>
        {busy === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'autopay' ? <Repeat className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
        {!paymentsEnabled ? 'Payments coming soon' : mode === 'autopay' ? `Start autopay · ${formatInr(plan.price)}/mo` : `Pay ${formatInr(plan.price)}`}
      </button>
    );
  };

  const pct = usage && !usage.unlimited ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;

  return (
    <PageShell
      eyebrow="Pricing"
      icon={<CreditCard className="h-3.5 w-3.5" />}
      title={<>Simple plans, <Highlight>no surprises</Highlight></>}
      description={`Start free, upgrade when you need more. Pay once for ${PLAN_DAYS} days, or turn on autopay and never run out. Secure payments by Razorpay.`}
    >
      {/* Current plan + usage */}
      {user && usage && (
        <section className={`${card} p-6 md:p-8`}>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-md shadow-green-600/30">
                {usage.unlimited ? <Crown className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
              </span>
              <div>
                <Eyebrow icon={<Receipt className="h-3.5 w-3.5" />}>{usage.unlimited ? 'Admin account' : 'Your plan'}</Eyebrow>
                <h2 className="mt-1 text-2xl font-black text-navy-900">
                  {usage.unlimited ? 'No plan needed' : usage.planName}
                  {usage.source && (
                    <span className="ml-2 align-middle rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                      {usage.source === 'subscription' ? 'Autopay' : 'Paid once'}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-slate-500">
                  {usage.unlimited
                    ? 'Unlimited messages and every feature. Plans below are what your users can buy.'
                    : `${usage.source === 'subscription' && autopayOn ? 'Renews' : usage.planId === 'free' ? 'Resets' : 'Ends'} on ${fmtDate(usage.periodEnd)}`}
                </p>
              </div>
            </div>

            {!usage.unlimited && (
              <div className="w-full max-w-sm">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-navy-900">
                    {usage.used.toLocaleString('en-IN')} <span className="font-normal text-slate-500">of {usage.limit.toLocaleString('en-IN')} messages</span>
                  </span>
                  <span className={`text-xs font-semibold ${pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-green-700'}`}>{pct}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">{(usage.remaining ?? 0).toLocaleString('en-IN')} messages left</p>
              </div>
            )}
          </div>

          {sub && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <RefreshCw className="h-4 w-4 text-green-600" />
                Autopay ({sub.planId === 'pro' ? 'Pro' : 'Basic'}):{' '}
                <strong className="text-navy-900">
                  {autopayOn ? 'On' : sub.status === 'cancelled' ? 'Off' : sub.status === 'created' ? 'Waiting for payment' : sub.status}
                </strong>
              </span>
              {(autopayOn || sub.status === 'created') && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={busy === 'cancel'}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  {busy === 'cancel' && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Turn off autopay
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {user?.role === 'owner' && info && !info.plans_enabled && (
        <Notice tone="warning">
          Paid plans are off, so users can&apos;t see this page and everything is free for them. Turn on <strong>Paid plans</strong> on the{' '}
          <a href="/settings" className="font-semibold underline underline-offset-2">
            Settings
          </a>{' '}
          page when you are ready to charge.
        </Notice>
      )}

      {user && info && info.plans_enabled && !info.payments_enabled && (
        <Notice tone="info">
          {user.role === 'owner'
            ? 'Online payments are off. Add the Razorpay keys on the Settings page to accept payments.'
            : 'Online payments are being set up. Please check back soon.'}
        </Notice>
      )}

      {/* Plans */}
      <section className="space-y-8 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Eyebrow icon={<CreditCard className="h-3.5 w-3.5" />}>Plans</Eyebrow>
            <h2 className="text-2xl font-black tracking-tight text-navy-900 md:text-3xl">Choose your plan</h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div role="radiogroup" aria-label="Payment type" className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {(
                [
                  ['once', `Pay once · ${PLAN_DAYS} days`, Wallet],
                  ['autopay', 'Autopay · monthly', Repeat],
                ] as const
              ).map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={mode === value}
                  onClick={() => setMode(value)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    mode === value ? 'bg-green-600 text-white shadow-sm' : 'text-slate-500 hover:text-navy-900'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
            {info?.test_mode && <span className="text-[11px] font-medium text-amber-600">Test mode: use Razorpay test cards or UPI, no real money is charged.</span>}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl p-7 ${
                plan.popular
                  ? 'border-2 border-green-500 bg-white shadow-[0_24px_60px_-24px_rgba(22,163,74,0.55)]'
                  : `${card}`
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold text-navy-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl font-black tracking-tight text-navy-900">{formatInr(plan.price)}</span>
                <span className="text-sm text-slate-500">{plan.price === 0 ? 'forever' : mode === 'autopay' ? '/ month' : `/ ${PLAN_DAYS} days`}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-green-700">
                {plan.messages.toLocaleString('en-IN')} messages
                {plan.price > 0 && (
                  <span className="font-normal text-slate-500"> · {formatInr(Math.round((plan.price / plan.messages) * 100) / 100)} per message</span>
                )}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              {buttonFor(plan)}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-500">
          Prices in Indian Rupees. Payments are processed securely by Razorpay (UPI, cards, netbanking, wallets). Unused messages do not carry over.
        </p>
      </section>

      {/* Payment history */}
      {user && info && info.payments.length > 0 && (
        <section className={`${card} overflow-hidden`}>
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <Receipt className="h-4 w-4 text-green-600" />
            <h2 className="font-bold text-navy-900">Payment history</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Plan</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Payment ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {info.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-3 text-slate-600">{fmtDate(p.at)}</td>
                    <td className="px-6 py-3 font-semibold text-navy-900">{p.planId === 'pro' ? 'Pro' : 'Basic'}</td>
                    <td className="px-6 py-3 text-slate-600">{p.kind === 'subscription' ? 'Autopay' : 'Paid once'}</td>
                    <td className="px-6 py-3 text-slate-600">{formatInr(p.amount)}</td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-500">{p.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pricing FAQ */}
      <section className="space-y-8 pt-8">
        <div className="space-y-2">
          <Eyebrow icon={<HelpCircle className="h-3.5 w-3.5" />}>FAQ</Eyebrow>
          <h2 className="text-2xl font-black tracking-tight text-navy-900 md:text-3xl">
            Billing <Highlight>questions</Highlight>
          </h2>
        </div>
        <FaqAccordion items={PRICING_FAQS} columns={2} idPrefix="pricing-faq" />
      </section>
    </PageShell>
  );
};
