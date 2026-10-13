// App settings the admin edits on the Settings page (/settings) instead of in .env.
// Saved values live in data/settings.json (gitignored) and take effect immediately, without a restart.
// A setting that was never saved (or was reset) falls back to the same-named variable in .env.
// Boot-time values (PORT, HOST, DATA_DIR, SESSION_SECRET) stay in .env only.

import fs from 'fs';
import path from 'path';
import type { Express, Request } from 'express';
import { requireAdmin, requireJson } from './auth';
import { emailLayout, sendEmail } from './mailer';

const SETTINGS_FILE = path.join(path.resolve(process.env.DATA_DIR || './data'), 'settings.json');

export interface SettingDef {
  key: string;
  label: string;
  group: 'AI' | 'Payments' | 'Email' | 'Site';
  help: string;
  /** Secrets are shown masked on the Settings page (admin session only) until the eye button is clicked */
  secret?: boolean;
  /** On/off switch stored as "true" / "false" */
  toggle?: boolean;
  /** Toggle state while nothing is saved (and .env has no value) */
  defaultOn?: boolean;
  /** Toggle captions shown next to the switch */
  onLabel?: string;
  offLabel?: string;
  placeholder?: string;
}

export const SETTINGS: SettingDef[] = [
  {
    key: 'NVIDIA_API_KEY',
    label: 'NVIDIA API key',
    group: 'AI',
    help: 'Powers the AI Composer. Get free credits at build.nvidia.com.',
    secret: true,
    placeholder: 'nvapi-...',
  },
  {
    key: 'PLANS_ENABLED',
    label: 'Paid plans',
    group: 'Payments',
    help: 'While off, every user gets unlimited messages and all features for free, and the Pricing page is hidden. Turn on when you are ready to charge.',
    toggle: true,
    defaultOn: false,
    onLabel: 'On: plan limits apply and the Pricing page is live',
    offLabel: 'Off: everything is free for everyone',
  },
  {
    key: 'RAZORPAY_KEY_ID',
    label: 'Razorpay key id',
    group: 'Payments',
    help: 'Razorpay Dashboard → Account & Settings → API Keys. rzp_test_... for testing, rzp_live_... for real payments.',
    placeholder: 'rzp_live_...',
  },
  {
    key: 'RAZORPAY_KEY_SECRET',
    label: 'Razorpay key secret',
    group: 'Payments',
    help: 'Shown once when the API key is generated in the Razorpay Dashboard.',
    secret: true,
  },
  {
    key: 'RAZORPAY_WEBHOOK_SECRET',
    label: 'Razorpay webhook secret',
    group: 'Payments',
    help: 'Any long random text. Enter the same value when adding the webhook in the Razorpay Dashboard.',
    secret: true,
  },
  {
    key: 'SMTP_HOST',
    label: 'SMTP host',
    group: 'Email',
    help: 'Mail server for sign-up verification and password reset emails, e.g. smtp.gmail.com, smtp.zoho.in or your hosting mail server. New sign-ups are blocked until this is set.',
    placeholder: 'smtp.example.com',
  },
  {
    key: 'SMTP_PORT',
    label: 'SMTP port',
    group: 'Email',
    help: '587 (STARTTLS) is the usual choice; 465 uses TLS from the start.',
    placeholder: '587',
  },
  {
    key: 'SMTP_USER',
    label: 'SMTP username',
    group: 'Email',
    help: 'Usually the full email address of the mailbox.',
    placeholder: 'no-reply@example.com',
  },
  {
    key: 'SMTP_PASS',
    label: 'SMTP password',
    group: 'Email',
    help: 'Mailbox password, or an app password for Gmail / Google Workspace.',
    secret: true,
  },
  {
    key: 'SMTP_FROM',
    label: 'From address',
    group: 'Email',
    help: 'Sender shown to users. Must be an address your SMTP account is allowed to send from.',
    placeholder: 'WA Direct <no-reply@example.com>',
  },
  {
    key: 'APP_URL',
    label: 'Site URL',
    group: 'Site',
    help: 'Public address of this site, used for password reset links, the sitemap and canonical links. Set it in production; when empty the address in the browser is used.',
    placeholder: 'https://example.com',
  },
  {
    key: 'ALLOW_REGISTRATION',
    label: 'Allow new sign-ups',
    group: 'Site',
    help: 'Turn off to close public sign-up. Existing accounts can still log in.',
    toggle: true,
    defaultOn: true,
    onLabel: 'Anyone can create an account',
    offLabel: 'Sign-up is closed',
  },
];

const DEFS = new Map(SETTINGS.map((s) => [s.key, s]));

let cache: Record<string, string> | null = null;

function load(): Record<string, string> {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  } catch {
    cache = {};
  }
  return cache!;
}

function save(values: Record<string, string>) {
  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
  // write-then-rename so a crash never leaves a half-written file; 0600 because it holds secrets
  const tmp = `${SETTINGS_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(values, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, SETTINGS_FILE);
  cache = values;
}

/** The value saved on the Settings page, otherwise the .env value, otherwise '' */
export function getSetting(key: string): string {
  const saved = load()[key];
  if (saved !== undefined && saved !== '') return saved;
  return process.env[key]?.trim() || '';
}

/** Paid plans switched on by the admin. Until then everyone is unlimited and the Pricing page is hidden. */
export const plansEnabled = () => getSetting('PLANS_ENABLED') === 'true';

/** Public origin for absolute links: the Site URL setting, otherwise the address of this request */
export function publicOrigin(req: Request): string {
  const configured = getSetting('APP_URL');
  if (configured && /^https?:\/\/[^\s]+$/i.test(configured)) return configured.replace(/\/+$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

const mask = (value: string) => (value.length <= 8 ? '•'.repeat(8) : `${value.slice(0, 4)}${'•'.repeat(8)}${value.slice(-4)}`);

export function registerSettingsRoutes(app: Express) {
  // Session login only: API keys are embedded in scripts and must never be able to read or change secrets
  app.use('/api/admin', requireJson, requireAdmin, (req, res, next) => {
    if (req.authVia !== 'session') return res.status(403).json({ error: 'Settings can only be changed from the website.' });
    next();
  });

  app.get('/api/admin/settings', (_req, res) => {
    const saved = load();
    res.json({
      settings: SETTINGS.map((def) => {
        const value = getSetting(def.key);
        const source = saved[def.key] ? 'admin' : process.env[def.key]?.trim() ? 'env' : 'none';
        return {
          ...def,
          source,
          // Full values, secrets included: this route is limited to the admin's browser session (never an API key)
          value,
          preview: def.secret && value ? mask(value) : '',
        };
      }),
    });
  });

  // Body: { values: { KEY: "new value" | null } }. null removes the saved value (back to .env).
  // Keys left out are unchanged, so an untouched secret field is never overwritten.
  app.put('/api/admin/settings', (req, res) => {
    const input = req.body?.values;
    if (!input || typeof input !== 'object') return res.status(400).json({ error: 'Nothing to save.' });

    const next = { ...load() };
    for (const [key, raw] of Object.entries(input)) {
      const def = DEFS.get(key);
      if (!def) return res.status(400).json({ error: `Unknown setting: ${key}` });
      if (raw === null) {
        delete next[key];
        continue;
      }
      let value = String(raw).trim();
      if (value.length > 500) return res.status(400).json({ error: `${def.label} is too long.` });
      if (def.toggle) value = value === 'false' ? 'false' : 'true';
      if (key === 'APP_URL' && value && !/^https?:\/\/[^\s]+$/i.test(value)) {
        return res.status(400).json({ error: 'Site URL must start with http:// or https://', field: key });
      }
      if (key === 'SMTP_PORT' && value && !/^\d{1,5}$/.test(value)) {
        return res.status(400).json({ error: 'SMTP port must be a number such as 587 or 465.', field: key });
      }
      if (value) next[key] = key === 'APP_URL' ? value.replace(/\/+$/, '') : value;
      else delete next[key];
    }
    save(next);
    res.json({ success: true });
  });

  // Sends a test email to the admin's own address with the saved SMTP settings
  app.post('/api/admin/settings/test-email', async (req, res) => {
    try {
      await sendEmail({
        to: req.user!.email,
        subject: 'Test email from WA Direct Automation',
        ...emailLayout({
          heading: 'Email is working',
          paragraphs: ['Your SMTP settings are correct. Password reset emails will be sent from this address.'],
        }),
      });
      res.json({ success: true, to: req.user!.email });
    } catch (e: any) {
      res.status(502).json({ error: `Could not send the test email: ${e?.message || 'unknown error'}` });
    }
  });
}
