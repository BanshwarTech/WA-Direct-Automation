import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { AuthError, useAuth } from '../auth/AuthContext';
import { navigate, routeFromPath } from '../hooks/useRoute';
import { Select } from '../components/Select';
import { countryOptions, DEFAULT_COUNTRY, dialCode } from '../data/countries';
import { btnPrimary } from '../components/ui';
import { Logo } from '../components/Logo';

// Where to go after signing in: the ?next= path when it is a safe same-site page, otherwise Send Messages
function goNext() {
  const next = new URLSearchParams(window.location.search).get('next') || '/send';
  const route = next.startsWith('/') && !next.startsWith('//') ? routeFromPath(next) : null;
  navigate(route && route !== 'login' && route !== 'register' ? route : 'send');
}

// Carries ?next= across the login/register switch. Read after mount so SSR and hydration markup match.
function useWithNext() {
  const [next, setNext] = useState<string | null>(null);
  useEffect(() => setNext(new URLSearchParams(window.location.search).get('next')), []);
  return (path: string) => (next ? `${path}?next=${encodeURIComponent(next)}` : path);
}

/* ---------------------------------- brand panel ---------------------------------- */

// Deterministic QR-like pattern (decorative): finder squares in three corners plus pseudo-random modules
const QR_SIZE = 21;
const QR_CELLS = Array.from({ length: QR_SIZE * QR_SIZE }, (_, i) => {
  const x = i % QR_SIZE;
  const y = Math.floor(i / QR_SIZE);
  const inFinder = (fx: number, fy: number) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7;
  for (const [fx, fy] of [[0, 0], [14, 0], [0, 14]]) {
    if (inFinder(fx, fy)) {
      const dx = x - fx;
      const dy = y - fy;
      return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
    }
  }
  return ((x * 7 + y * 13 + x * y * 3) % 5) < 2;
});

const QrCard: React.FC = () => (
  <div className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md">
    <div className="relative overflow-hidden rounded-2xl bg-white p-3">
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${QR_SIZE}, minmax(0, 1fr))` }}>
        {QR_CELLS.map((on, i) => (
          <span key={i} className={`aspect-square rounded-[1px] ${on ? 'bg-navy-900' : 'bg-transparent'}`} />
        ))}
      </div>
      {/* scanning line */}
      <span aria-hidden className="absolute inset-x-2 top-2 h-8 animate-scan bg-gradient-to-b from-wa/0 via-wa/40 to-wa/0" />
      <span aria-hidden className="absolute inset-x-2 top-6 h-0.5 animate-scan rounded-full bg-wa shadow-[0_0_12px_2px_rgba(37,211,102,0.8)]" />
    </div>
    <div className="mt-4 flex items-center justify-between text-xs">
      <span className="font-semibold text-white">Scan once to link</span>
      <span className="rounded-full bg-wa/15 px-2 py-0.5 font-medium text-wa">Your QR</span>
    </div>
  </div>
);

const ChatPreview: React.FC = () => (
  <div className="flex flex-col justify-center gap-3">
    <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5 text-sm text-slate-100 backdrop-blur">
      Is my order shipped yet?
      <div className="mt-0.5 text-[10px] text-slate-400">10:41</div>
    </div>
    <div className="ml-auto max-w-[92%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3.5 py-2.5 text-sm text-navy-900 shadow-lg shadow-black/20">
      <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-green-600/10 px-2 py-0.5 text-[10px] font-semibold text-green-800">
        <Sparkles className="h-3 w-3" /> AI drafted
      </span>
      <div>Yes! Order #1042 is out for delivery and arrives today 🚚</div>
      <div className="mt-0.5 text-right text-[10px] text-slate-500">
        10:41 <span className="text-sky-500">✓✓</span>
      </div>
    </div>
    <div className="inline-flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-3" aria-label="Customer is typing">
      {[0, 1, 2].map((d) => (
        <span key={d} className="h-1.5 w-1.5 animate-typing rounded-full bg-slate-300" style={{ animationDelay: `${d * 0.18}s` }} />
      ))}
    </div>
  </div>
);

const BrandPanel: React.FC = () => (
  <aside className="relative hidden h-full flex-col justify-between gap-6 overflow-hidden bg-navy-950 p-10 text-white lg:flex xl:p-12 [@media(max-height:760px)]:py-8">
    {/* aurora + dotted grid */}
    <div aria-hidden className="absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full bg-wa/25 blur-[120px]" />
    <div aria-hidden className="absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-navy-600/40 blur-[120px]" />
    <div
      aria-hidden
      className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_45%,black,transparent)]"
    />

    {/* top: logo + pill */}
    <div className="relative flex items-center justify-between">
      <a href="/" aria-label="WA Direct Automation home">
        <Logo tone="dark" />
      </a>
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
        <span className="h-1.5 w-1.5 rounded-full bg-wa" /> Free to get started
      </span>
    </div>

    {/* middle: headline + product moment */}
    <div className="relative space-y-8 [@media(max-height:760px)]:space-y-5">
      <div className="space-y-3">
        <h2 className="text-4xl font-black leading-[1.05] tracking-tight xl:text-5xl [@media(max-height:760px)]:text-4xl">
          Your WhatsApp.
          <br />
          <span className="bg-gradient-to-r from-wa via-emerald-300 to-wa bg-clip-text text-transparent">Your rules.</span>
        </h2>
        <p className="max-w-md text-slate-300">
          Link your own number with a private QR code, then send single or bulk messages, written by you or by AI.
        </p>
      </div>
      <div className="grid max-w-xl grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6 [@media(max-height:700px)]:max-w-lg">
        <QrCard />
        <ChatPreview />
      </div>
    </div>

    {/* bottom: honest stats */}
    <dl className="relative grid max-w-xl grid-cols-3 [@media(max-height:760px)]:hidden divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] py-4 backdrop-blur">
      {[
        ['₹0', 'per message'],
        ['~1 min', 'to get started'],
        ['100%', 'your own number'],
      ].map(([v, l]) => (
        <div key={l} className="px-4 text-center">
          <dt className="sr-only">{l}</dt>
          <dd className="text-xl font-black text-white">{v}</dd>
          <dd className="text-xs text-slate-400">{l}</dd>
        </div>
      ))}
    </dl>
  </aside>
);

/* ---------------------------------- form pieces ---------------------------------- */

// One-screen layout: the page itself never scrolls; only the form column can, on unusually short screens
const AuthLayout: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="grid h-dvh overflow-hidden bg-white lg:grid-cols-[1fr_1.05fr]">
    <section className="flex h-dvh flex-col overflow-y-auto px-6 py-6 sm:px-10">
      <div className="flex items-center justify-between">
        <a href="/" aria-label="WA Direct Automation home" className="lg:invisible">
          <Logo size="sm" />
        </a>
        <a href="/" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-green-700">
          <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" /> Back to home
        </a>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-6">
        <h1 className="text-3xl font-black tracking-tight text-navy-900">{title}</h1>
        <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </section>
    <BrandPanel />
  </div>
);

const inputBox = (invalid?: boolean) =>
  `mt-1.5 flex items-center rounded-xl border bg-white transition focus-within:ring-4 ${
    invalid ? 'border-red-300 focus-within:ring-red-500/15' : 'border-slate-300 hover:border-slate-400 focus-within:border-green-600 focus-within:ring-green-500/15'
  }`;
const inputCls = 'w-full min-w-0 rounded-xl bg-transparent px-3.5 py-2.5 text-[15px] text-navy-900 placeholder-slate-400 outline-none';

const Label: React.FC<{ htmlFor: string; children: React.ReactNode; action?: React.ReactNode }> = ({ htmlFor, children, action }) => (
  <div className="flex items-center justify-between">
    <label htmlFor={htmlFor} className="text-sm font-semibold text-navy-900">
      {children} <span className="text-red-500">*</span>
    </label>
    {action}
  </div>
);

const Field: React.FC<{
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  invalid?: boolean;
  action?: React.ReactNode;
  trailing?: React.ReactNode;
}> = ({ id, label, type, value, onChange, placeholder, autoComplete, invalid, action, trailing }) => (
  <div>
    <Label htmlFor={id} action={action}>
      {label}
    </Label>
    <div className={inputBox(invalid)}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        aria-invalid={invalid || undefined}
        className={inputCls}
      />
      {trailing && <span className="pr-3.5">{trailing}</span>}
    </div>
  </div>
);

const PhoneField: React.FC<{
  code: string;
  setCode: (v: string) => void;
  number: string;
  setNumber: (v: string) => void;
  invalid?: boolean;
}> = ({ code, setCode, number, setNumber, invalid }) => (
  <div>
    <Label htmlFor="reg-phone">Mobile number</Label>
    <div className={inputBox(invalid)}>
      <Select
        variant="attached"
        ariaLabel="Country code"
        value={code}
        onChange={setCode}
        searchable
        searchPlaceholder="Search country or code"
        menuWidth="w-80"
        options={countryOptions('name-first')}
      />
      <input
        id="reg-phone"
        type="tel"
        inputMode="numeric"
        value={number}
        onChange={(e) => setNumber(e.target.value.replace(/[^0-9\s-]/g, ''))}
        placeholder="98765 43210"
        autoComplete="tel-national"
        required
        aria-invalid={invalid || undefined}
        className={inputCls}
      />
    </div>
  </div>
);

const SubmitButton: React.FC<{ busy: boolean; children: React.ReactNode }> = ({ busy, children }) => (
  <button
    type="submit"
    disabled={busy}
    className={`group w-full ${btnPrimary}`}
  >
    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
    {!busy && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
  </button>
);

const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {message}
  </div>
);

function usePasswordToggle() {
  const [show, setShow] = useState(false);
  const toggle = (
    <button
      type="button"
      onClick={() => setShow((s) => !s)}
      className="flex text-slate-400 hover:text-navy-900"
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
  return { type: show ? 'text' : 'password', toggle, setShow };
}

// Strong random password from the browser's CSPRNG, guaranteed to mix all character classes
function generatePassword(length = 16) {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@#$%&*?-_'];
  const all = sets.join('');
  const pick = (chars: string) => chars[crypto.getRandomValues(new Uint32Array(1))[0] % chars.length];
  const chars = [...sets.map(pick), ...Array.from({ length: length - sets.length }, () => pick(all))];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

const SwitchLink: React.FC<{ text: string; label: string; href: string }> = ({ text, label, href }) => (
  <p className="mt-5 text-sm text-slate-600">
    {text}{' '}
    <a href={href} className="font-semibold text-green-700 hover:underline">
      {label}
    </a>
  </p>
);

/* ---------------------------------- pages ---------------------------------- */

export const LoginPage: React.FC = () => {
  const { login, registrationOpen } = useAuth();
  const withNext = useWithNext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pw = usePasswordToggle();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to send messages from your linked WhatsApp.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <ErrorBox message={error} />}
        <Field id="login-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
        <Field
          id="login-password"
          label="Password"
          type={pw.type}
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
          trailing={pw.toggle}
        />
        <div className="pt-1">
          <SubmitButton busy={busy}>Log in</SubmitButton>
        </div>
      </form>
      {registrationOpen && <SwitchLink text="Don't have an account?" label="Create one free" href={withNext('/register')} />}
    </AuthLayout>
  );
};

export const RegisterPage: React.FC = () => {
  const { register, registrationOpen } = useAuth();
  const withNext = useWithNext();
  const [name, setName] = useState('');
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY);
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const pw = usePasswordToggle();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const digits = mobile.replace(/[^0-9]/g, '').replace(/^0+/, '');
      await register({ name, email, password, phone: `${dialCode(countryIso)}${digits}` });
      goNext();
    } catch (err) {
      setError(err instanceof AuthError ? { message: err.message, field: err.field } : { message: 'Registration failed' });
    } finally {
      setBusy(false);
    }
  };

  if (!registrationOpen) {
    return (
      <AuthLayout title="Registration is closed" subtitle="This server is not accepting new accounts right now.">
        <SwitchLink text="Already have an account?" label="Log in" href={withNext('/login')} />
      </AuthLayout>
    );
  }

  const strength =
    password.length === 0 ? 0 : password.length < 8 ? 1 : password.length >= 12 && /\d/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 3 : 2;
  const strengthLabel = ['At least 8 characters', 'Too short', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-green-500'][strength];

  return (
    <AuthLayout title="Create account" subtitle="Free account required to send messages. You'll link your WhatsApp next.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <ErrorBox message={error.message} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="reg-name"
            label="Full name"
            type="text"
            value={name}
            onChange={setName}
            placeholder="Your full name"
            autoComplete="name"
            invalid={error?.field === 'name'}
          />
          <PhoneField code={countryIso} setCode={setCountryIso} number={mobile} setNumber={setMobile} invalid={error?.field === 'phone'} />
        </div>
        <Field
          id="reg-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          invalid={error?.field === 'email'}
        />
        <div>
          <Field
            id="reg-password"
            label="Password"
            type={pw.type}
            value={password}
            onChange={setPassword}
            placeholder="Create a password"
            autoComplete="new-password"
            invalid={error?.field === 'password'}
            trailing={pw.toggle}
            action={
              <button
                type="button"
                onClick={() => {
                  setPassword(generatePassword());
                  pw.setShow(true);
                }}
                className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800"
              >
                <Wand2 className="h-3.5 w-3.5" /> Generate
              </button>
            }
          />
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="flex flex-1 gap-1">
              {[1, 2, 3].map((i) => (
                <span key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : 'bg-slate-200'}`} />
              ))}
            </span>
            <span className={strength === 3 ? 'font-medium text-green-700' : ''}>{strengthLabel}</span>
          </div>
        </div>
        <div className="pt-1">
          <SubmitButton busy={busy}>Create account</SubmitButton>
        </div>
      </form>
      <SwitchLink text="Already have an account?" label="Log in" href={withNext('/login')} />
    </AuthLayout>
  );
};
