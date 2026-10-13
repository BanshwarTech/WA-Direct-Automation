import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Mail,
  RotateCcw,
  Send,
  Settings,
  Sparkles,
} from 'lucide-react';
import { PageShell, Highlight } from '../components/PageShell';
import { inputCls, btnPrimary, btnSecondary } from '../components/ui';
import { confirmDialog } from '../components/Dialog';
import { toast } from '../components/Toast';

// Mirrors the settings list in appSettings.ts (the server sends it with each field's current state)
interface Setting {
  key: string;
  label: string;
  group: GroupId;
  help: string;
  secret?: boolean;
  toggle?: boolean;
  defaultOn?: boolean;
  onLabel?: string;
  offLabel?: string;
  placeholder?: string;
  /** admin = saved on this page, env = from .env, none = not set */
  source: 'admin' | 'env' | 'none';
  /** Current value (secrets are shown masked) */
  value: string;
  /** Masked secret, e.g. nvap••••••••x9Qz */
  preview: string;
}

type GroupId = 'AI' | 'Payments' | 'Email' | 'Site';
type Status = 'ready' | 'partial' | 'missing' | 'optional';

const GROUPS: { id: GroupId; title: string; icon: React.ElementType; description: string; tint: string }[] = [
  { id: 'AI', title: 'AI Composer', icon: Sparkles, description: 'NVIDIA NIM key used to write messages with AI.', tint: 'from-violet-500 to-fuchsia-600 shadow-violet-500/30' },
  { id: 'Payments', title: 'Plans & payments', icon: CreditCard, description: 'Switch on paid plans and connect Razorpay so users can buy them.', tint: 'from-sky-500 to-blue-600 shadow-sky-500/30' },
  { id: 'Email', title: 'Email (SMTP)', icon: Mail, description: 'Mail server for sign-up verification and password reset emails.', tint: 'from-amber-400 to-orange-500 shadow-amber-500/30' },
  { id: 'Site', title: 'Site', icon: Globe, description: 'Public address and who can create an account.', tint: 'from-green-500 to-emerald-600 shadow-green-600/30' },
];

// Fields shown side by side on wide screens
const HALF_WIDTH = new Set(['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']);

const isUrl = (v: string) => /^https?:\/\/[^\s]+$/i.test(v);

const STATUS: Record<Status, { label: string; cls: string; icon: React.ReactNode }> = {
  ready: { label: 'Ready', cls: 'bg-green-50 text-green-700 ring-green-200', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  partial: { label: 'Partly set', cls: 'bg-amber-50 text-amber-700 ring-amber-200', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  missing: { label: 'Needs setup', cls: 'bg-red-50 text-red-600 ring-red-200', icon: <CircleDashed className="h-3.5 w-3.5" /> },
  optional: { label: 'Optional', cls: 'bg-slate-100 text-slate-600 ring-slate-200', icon: <CircleDashed className="h-3.5 w-3.5" /> },
};

const SOURCE_BADGE: Record<Setting['source'], { label: string; cls: string }> = {
  admin: { label: 'Saved here', cls: 'bg-green-50 text-green-700 ring-green-200' },
  env: { label: 'From .env', cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  none: { label: 'Not set', cls: 'bg-slate-100 text-slate-500 ring-slate-200' },
};

const card =
  'rounded-3xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(10,31,51,0.04),0_12px_32px_-12px_rgba(10,31,51,0.14)]';

/** How complete a section is, from the saved state */
function groupStatus(id: GroupId, settings: Setting[]): { status: Status; note: string } {
  const set = (key: string) => settings.find((s) => s.key === key)?.source !== 'none';
  const value = (key: string) => settings.find((s) => s.key === key)?.value ?? '';
  switch (id) {
    case 'AI':
      return set('NVIDIA_API_KEY') ? { status: 'ready', note: 'AI Composer is live' } : { status: 'missing', note: 'AI Composer shows demo replies' };
    case 'Payments':
      if (value('PLANS_ENABLED') !== 'true') return { status: 'optional', note: 'Plans off: everything is free' };
      if (!set('RAZORPAY_KEY_ID') || !set('RAZORPAY_KEY_SECRET')) return { status: 'missing', note: 'Users cannot buy plans yet' };
      return set('RAZORPAY_WEBHOOK_SECRET') ? { status: 'ready', note: 'Payments and autopay are on' } : { status: 'partial', note: 'Add the webhook secret for autopay' };
    case 'Email':
      return set('SMTP_HOST') && set('SMTP_FROM') ? { status: 'ready', note: 'Verification and reset emails work' } : { status: 'missing', note: 'New sign-ups are blocked' };
    case 'Site': {
      const url = value('APP_URL');
      if (url && !isUrl(url)) return { status: 'partial', note: 'Site URL is not a valid address' };
      return url ? { status: 'ready', note: url.replace(/^https?:\/\//, '') } : { status: 'optional', note: 'Using the browser address' };
    }
  }
}

const StatusPill: React.FC<{ status: Status }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${STATUS[status].cls}`}>
    {STATUS[status].icon} {STATUS[status].label}
  </span>
);

const SecretInput: React.FC<{ id: string; value: string; onChange: (v: string) => void; placeholder: string }> = ({ id, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        // A text field masked with CSS instead of type="password": browsers then neither offer to save the key as a
        // login password nor auto-fill it back in (which made the page show an unsaved change after every save)
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        data-1p-ignore
        data-lpignore="true"
        spellCheck={false}
        style={{ WebkitTextSecurity: show || !value ? 'none' : 'disc' } as React.CSSProperties}
        className={`${inputCls} pr-10 font-mono`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-navy-900"
        aria-label={show ? 'Hide value' : 'Show value'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Setting[] | null>(null);
  // Edited values only; untouched fields are not sent
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [active, setActive] = useState<GroupId>('AI');
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);

  const load = async () => {
    const res = await fetch('/api/admin/settings');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Could not load settings (${res.status})`);
    setSettings(data.settings);
    setDraft({});
  };

  useEffect(() => {
    setOrigin(window.location.origin);
    load().catch((e) => setLoadError(e.message));
  }, []);

  const put = async (values: Record<string, string | null>, success: string) => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Save failed (${res.status})`);
      await load();
      toast.success(success);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    // Only fields that really differ from what is saved; clearing a field removes the saved value (back to .env)
    const values = Object.fromEntries(Object.entries(draft).filter(([key, v]) => v !== settings?.find((s) => s.key === key)?.value));
    if (Object.keys(values).length === 0) return setDraft({});
    put(values, 'Settings saved. They are in effect now, no restart needed.');
  };

  const reset = async (s: Setting) => {
    const ok = await confirmDialog({
      title: `Reset ${s.label}?`,
      message: 'The value saved here is removed. The server then uses the value from .env, if there is one.',
      confirmLabel: 'Reset',
      tone: 'danger',
    });
    if (ok) put({ [s.key]: null }, `${s.label} reset.`);
  };

  const sendTestEmail = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/admin/settings/test-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Test email failed (${res.status})`);
      toast.success(`Test email sent to ${data.to}. Check the inbox (and spam folder).`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTesting(false);
    }
  };

  const webhookUrl = `${origin}/api/billing/webhook`;
  const isLocal = /\/\/(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(origin);
  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const changedCount = Object.entries(draft).filter(([key, v]) => v !== settings?.find((s) => s.key === key)?.value).length;
  const changed = changedCount > 0;
  const group = GROUPS.find((g) => g.id === active)!;

  const renderField = (s: Setting) => {
    const id = `setting-${s.key}`;
    const badge = SOURCE_BADGE[s.source];
    const edited = s.key in draft;
    const setValue = (v: string) => setDraft((d) => ({ ...d, [s.key]: v }));
    const toggleValue = edited ? draft[s.key] : s.value;
    const toggleOn = toggleValue ? toggleValue !== 'false' : Boolean(s.defaultOn);
    const shown = edited ? draft[s.key] : s.value;
    const badUrl = s.key === 'APP_URL' && shown !== '' && !isUrl(shown);

    return (
      <div key={s.key} className={`space-y-1.5 ${HALF_WIDTH.has(s.key) ? '' : 'sm:col-span-2'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
            {s.label}
            {edited && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Unsaved change" />}
          </label>
          <span className="flex items-center gap-2">
            {s.source === 'admin' && (
              <button
                type="button"
                onClick={() => reset(s)}
                disabled={busy}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-red-600 disabled:opacity-50"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${badge.cls}`}>{badge.label}</span>
          </span>
        </div>

        {s.toggle ? (
          <button
            id={id}
            type="button"
            role="switch"
            aria-checked={toggleOn}
            onClick={() => setValue(toggleOn ? 'false' : 'true')}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-left transition hover:border-slate-300"
          >
            <span className="text-sm text-slate-700">{toggleOn ? s.onLabel ?? 'On' : s.offLabel ?? 'Off'}</span>
            <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${toggleOn ? 'bg-green-600' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${toggleOn ? 'left-[22px]' : 'left-0.5'}`} />
            </span>
          </button>
        ) : s.secret ? (
          <SecretInput
            id={id}
            value={shown}
            onChange={setValue}
            placeholder={s.placeholder || 'Not set'}
          />
        ) : (
          <input
            id={id}
            type="text"
            value={shown}
            onChange={(e) => setValue(e.target.value)}
            placeholder={s.placeholder}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={badUrl || undefined}
            className={`${inputCls} font-mono ${badUrl ? '!border-amber-400 focus:!ring-amber-500/15' : ''}`}
          />
        )}
        {badUrl ? (
          <p className="flex items-start gap-1.5 text-xs leading-relaxed text-amber-700">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Not a valid address, so it is ignored. Enter the full URL, e.g. https://wa.example.com
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-slate-500">{s.help}</p>
        )}
      </div>
    );
  };

  return (
    <PageShell
      eyebrow="Settings"
      icon={<Settings className="h-3.5 w-3.5" />}
      title={<>Admin <Highlight>settings</Highlight></>}
      description="API keys, payments, email and sign-up in one place. Changes apply right away, no restart needed. A field you have not saved here keeps using its .env value."
    >
      {!settings ? (
        <div className={`${card} flex items-center gap-2 p-6 text-sm text-slate-500`}>
          {loadError || (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Loading settings…
            </>
          )}
        </div>
      ) : (
        <form onSubmit={save} className="space-y-6">
          {/* Overview: one tile per section; click to open it */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {GROUPS.map((g) => {
              const { status, note } = groupStatus(g.id, settings);
              const selected = g.id === active;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setActive(g.id)}
                  aria-pressed={selected}
                  className={`group rounded-2xl border bg-white p-4 text-left transition ${
                    selected ? 'border-green-400 ring-4 ring-green-500/10' : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${g.tint}`}>
                      <g.icon className="h-4 w-4" />
                    </span>
                    <StatusPill status={status} />
                  </div>
                  <div className="mt-3 text-sm font-bold text-navy-900">{g.title}</div>
                  <div className="mt-0.5 truncate text-xs text-slate-500">{note}</div>
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            {/* Section list (tabs on phones) */}
            <nav aria-label="Settings sections" className="lg:sticky lg:top-24 lg:self-start">
              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {GROUPS.map((g) => {
                  const selected = g.id === active;
                  const dirty = settings.some((s) => s.group === g.id && s.key in draft);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setActive(g.id)}
                      aria-current={selected ? 'page' : undefined}
                      className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                        selected ? 'bg-navy-900 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-navy-900'
                      }`}
                    >
                      <g.icon className={`h-4 w-4 ${selected ? 'text-wa' : 'text-slate-400'}`} />
                      <span className="flex-1 whitespace-nowrap">{g.title}</span>
                      {dirty && <span className="h-2 w-2 rounded-full bg-amber-400" title="Unsaved changes" />}
                      <ChevronRight className={`hidden h-4 w-4 lg:block ${selected ? 'text-slate-400' : 'text-transparent'}`} />
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Active section */}
            <section className={`${card} overflow-hidden`}>
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-6">
                <div className="flex items-start gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md ${group.tint}`}>
                    <group.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-navy-900">{group.title}</h2>
                    <p className="text-sm text-slate-500">{group.description}</p>
                  </div>
                </div>
                <StatusPill status={groupStatus(group.id, settings).status} />
              </header>

              <div className="grid gap-x-5 gap-y-6 p-6 sm:grid-cols-2">
                {settings.filter((s) => s.group === active).map(renderField)}

                {active === 'Email' && (
                  <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:col-span-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-navy-900">Check the connection</div>
                      <p className="text-xs leading-relaxed text-slate-500">Save first, then send a test email to your own address.</p>
                    </div>
                    <button type="button" onClick={sendTestEmail} disabled={testing || busy || changed} className={`${btnSecondary} !px-4 !py-2`}>
                      {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send test email
                    </button>
                  </div>
                )}

                {active === 'Payments' && origin && (
                  <div className="space-y-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:col-span-2">
                    <div className="text-sm font-semibold text-navy-900">Webhook URL for the Razorpay Dashboard</div>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                      <code className="flex-1 truncate font-mono text-xs text-navy-900">{webhookUrl}</code>
                      <button type="button" onClick={copyWebhook} className="text-slate-400 hover:text-navy-900" aria-label="Copy webhook URL">
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    {isLocal && (
                      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-amber-700">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Razorpay cannot reach localhost. Use your public HTTPS address once
                        the site is online.
                      </p>
                    )}
                    <p className="text-xs leading-relaxed text-slate-500">
                      Events: payment.captured, subscription.activated, subscription.charged, subscription.cancelled, subscription.halted,
                      subscription.completed.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Save bar: sticks to the bottom of the screen while there are unsaved changes */}
          <div
            className={`sticky bottom-4 z-30 transition-all duration-200 ${changed ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
            aria-hidden={!changed}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-5 py-3 shadow-[0_20px_50px_-16px_rgba(10,31,51,0.4)] backdrop-blur">
              <span className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {changedCount} unsaved change{changedCount === 1 ? '' : 's'}
              </span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setDraft({})} disabled={busy} className="text-sm font-semibold text-slate-500 hover:text-navy-900">
                  Discard
                </button>
                <button type="submit" disabled={!changed || busy} className={`${btnPrimary} !py-2.5`}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save settings
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </PageShell>
  );
};
