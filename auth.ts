// Authentication: local user store, scrypt password hashing, signed session cookies and per-user API keys.
// No database needed: users live in data/users.json (gitignored).

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { Express, NextFunction, Request, Response } from 'express';

const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SECRET_FILE = path.join(DATA_DIR, 'session-secret');
const COOKIE = 'wa_session';
const SESSION_DAYS = 7;

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string; // digits with country code, e.g. 919876543210
  role: 'owner' | 'member';
}

interface StoredUser extends PublicUser {
  passwordHash: string; // scrypt$<salt>$<hash>
  apiKey: string;
  createdAt: string;
  scenarios?: Scenario[];
  savedMessages?: SavedMessage[];
}

// A user-defined AI Composer scenario (name shown in the dropdown, instructions sent to the AI)
export interface Scenario {
  id: string;
  name: string;
  instructions: string;
}

// A message kept for reuse on the Send page: AI Composer output (history or saved) or typed by hand
export interface SavedMessage {
  id: string;
  title: string;
  text: string;
  source: 'ai' | 'manual';
  /** false = AI history entry (auto-trimmed); true/missing = saved by the user and kept */
  pinned?: boolean;
  createdAt: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}

// ---------- storage ----------

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadUsers(): StoredUser[] {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  ensureDataDir();
  // write-then-rename so a crash never leaves a half-written users file
  const tmp = `${USERS_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(users, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, USERS_FILE);
}

// Session signing secret: SESSION_SECRET from .env, otherwise generated once and kept in data/
function loadSecret(): Buffer {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32) return Buffer.from(process.env.SESSION_SECRET);
  try {
    return Buffer.from(fs.readFileSync(SECRET_FILE, 'utf-8').trim(), 'hex');
  } catch {
    ensureDataDir();
    const secret = crypto.randomBytes(48);
    fs.writeFileSync(SECRET_FILE, secret.toString('hex'), { mode: 0o600 });
    return secret;
  }
}
const SECRET = loadSecret();

const toPublic = ({ id, name, email, phone, role }: StoredUser): PublicUser => ({ id, name, email, phone: phone ?? '', role });

// Every account links its own WhatsApp, so sign-up is open by default. ALLOW_REGISTRATION=false closes it
// (the very first account can always be created).
export function registrationOpen(): boolean {
  return loadUsers().length === 0 || process.env.ALLOW_REGISTRATION !== 'false';
}

// Read-modify-write a single user record (used by per-user data such as saved scenarios)
export function updateUser<T>(userId: string, fn: (user: StoredUser) => T): T | undefined {
  const users = loadUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return undefined;
  const result = fn(user);
  saveUsers(users);
  return result;
}

export function getUserScenarios(userId: string): Scenario[] {
  return loadUsers().find((u) => u.id === userId)?.scenarios ?? [];
}

export function getUserMessages(userId: string): SavedMessage[] {
  return loadUsers().find((u) => u.id === userId)?.savedMessages ?? [];
}

// ---------- passwords ----------

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [, saltHex, hashHex] = stored.split('$');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// Equalises timing for unknown emails so responses don't reveal which accounts exist
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString('hex'));

const newApiKey = () => `wad_${crypto.randomBytes(24).toString('base64url')}`;

// ---------- sessions (stateless, HMAC-signed) ----------

function sign(payload: string) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
}

function createSessionToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + SESSION_DAYS * 86400_000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function readSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof uid === 'string' && Date.now() < exp ? uid : null;
  } catch {
    return null;
  }
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function setSessionCookie(req: Request, res: Response, token: string | null) {
  const secure = req.secure || req.get('x-forwarded-proto') === 'https';
  const attrs = ['Path=/', 'HttpOnly', 'SameSite=Lax', secure ? 'Secure' : ''].filter(Boolean);
  res.append(
    'Set-Cookie',
    token
      ? `${COOKIE}=${token}; Max-Age=${SESSION_DAYS * 86400}; ${attrs.join('; ')}`
      : `${COOKIE}=; Max-Age=0; ${attrs.join('; ')}`
  );
}

// ---------- rate limiting (in-memory) ----------

const attempts = new Map<string, { count: number; reset: number }>();
function rateLimited(key: string, limit = 10, windowMs = 15 * 60_000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.reset) {
    attempts.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

// ---------- middleware ----------

// Resolves the user from the session cookie, or from an API key (Authorization: Bearer / X-API-Key) for scripts
export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const users = loadUsers();
  const uid = readSessionToken(parseCookies(req.headers.cookie)[COOKIE]);
  let user = uid ? users.find((u) => u.id === uid) : undefined;

  if (!user) {
    const bearer = req.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
    const key = bearer || req.get('x-api-key');
    if (key) {
      user = users.find(
        (u) => u.apiKey.length === key.length && crypto.timingSafeEqual(Buffer.from(u.apiKey), Buffer.from(key))
      );
    }
  }
  if (user) req.user = toPublic(user);
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Please log in to continue.', authRequired: true });
  next();
}

// Admin-only features (the Scripts page and API keys) are limited to the owner account
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Please log in to continue.', authRequired: true });
  if (req.user.role !== 'owner') return res.status(403).json({ error: 'Only the admin can use this feature.' });
  next();
}

// State-changing requests must be JSON: browsers cannot send cross-site JSON without a CORS preflight,
// which (together with SameSite=Lax cookies) blocks CSRF.
export function requireJson(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'GET' && req.method !== 'HEAD' && !req.is('application/json')) {
    return res.status(415).json({ error: 'Requests must use Content-Type: application/json.' });
  }
  next();
}

// ---------- routes ----------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function registerAuthRoutes(app: Express, hooks: { onRegister?: (user: PublicUser, isFirst: boolean) => Promise<void> | void } = {}) {
  app.use('/api/auth', requireJson);

  app.get('/api/auth/me', (req, res) => {
    res.json({ user: req.user ?? null, registrationOpen: registrationOpen() });
  });

  app.post('/api/auth/register', async (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const phone = String(req.body?.phone ?? '').replace(/[^0-9]/g, '');

    if (rateLimited(`register:${req.ip}`, 5)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
    if (!registrationOpen()) {
      return res.status(403).json({ error: 'Registration is closed on this server. Ask the owner for an account.' });
    }
    if (name.length < 2 || name.length > 60) return res.status(400).json({ error: 'Enter your name (2–60 characters).', field: 'name' });
    if (!EMAIL_RE.test(email) || email.length > 120) return res.status(400).json({ error: 'Enter a valid email address.', field: 'email' });
    // E.164 allows up to 15 digits including the country code
    if (phone.length < 10 || phone.length > 15) {
      return res.status(400).json({ error: 'Enter a valid mobile number with country code.', field: 'phone' });
    }
    if (password.length < 8 || password.length > 200) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.', field: 'password' });
    }

    const users = loadUsers();
    if (users.some((u) => u.email === email)) {
      return res.status(409).json({ error: 'An account with this email already exists.', field: 'email' });
    }
    if (users.some((u) => u.phone === phone)) {
      return res.status(409).json({ error: 'An account with this mobile number already exists.', field: 'phone' });
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      role: users.length === 0 ? 'owner' : 'member',
      passwordHash: hashPassword(password),
      apiKey: newApiKey(),
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, user]);
    await hooks.onRegister?.(toPublic(user), users.length === 0);
    setSessionCookie(req, res, createSessionToken(user.id));
    res.status(201).json({ user: toPublic(user) });
  });

  app.post('/api/auth/login', (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');

    if (rateLimited(`login:${req.ip}:${email}`)) {
      return res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' });
    }
    const user = loadUsers().find((u) => u.email === email);
    const ok = verifyPassword(password, user?.passwordHash ?? DUMMY_HASH) && Boolean(user);
    if (!ok || !user) return res.status(401).json({ error: 'Incorrect email or password.' });

    attempts.delete(`login:${req.ip}:${email}`);
    setSessionCookie(req, res, createSessionToken(user.id));
    res.json({ user: toPublic(user) });
  });

  app.post('/api/auth/logout', (req, res) => {
    setSessionCookie(req, res, null);
    res.json({ success: true });
  });

  // API key for scripts: view and rotate (admin only, session only, never via another API key)
  app.get('/api/auth/api-key', requireAdmin, (req, res) => {
    const user = loadUsers().find((u) => u.id === req.user!.id);
    res.json({ apiKey: user?.apiKey ?? null });
  });

  app.post('/api/auth/api-key', requireAdmin, (req, res) => {
    const users = loadUsers();
    const user = users.find((u) => u.id === req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.apiKey = newApiKey();
    saveUsers(users);
    res.json({ apiKey: user.apiKey });
  });
}
