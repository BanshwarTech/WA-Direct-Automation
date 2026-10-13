// Per-user WhatsApp connections (Baileys multi-device). Every account links its own WhatsApp with its own QR code,
// and messages go out from that user's number. Sessions live in <DATA_DIR>/wa-sessions/<userId>/.

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  WASocket,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import fs from 'fs/promises';
import { existsSync, readdirSync } from 'fs';
import path from 'path';

const SESSIONS_DIR = path.resolve(process.env.DATA_DIR || './data', 'wa-sessions');
const LEGACY_DIR = path.resolve(process.env.WA_LEGACY_DIR || './gateway_auth'); // single-user session from before accounts existed
const IDLE_MS = 2 * 60_000; // stop issuing QR codes to unlinked users who stopped looking at the page

interface Session {
  sock: WASocket | null;
  ready: boolean;
  qr: string | null;
  starting: boolean;
  lastSeen: number;
}

const sessions = new Map<string, Session>();
const authDir = (userId: string) => path.join(SESSIONS_DIR, userId.replace(/[^a-zA-Z0-9-]/g, ''));

async function connect(userId: string): Promise<void> {
  const s = sessions.get(userId);
  if (!s || s.starting) return;
  s.starting = true;

  try {
    const dir = authDir(userId);
    const { state, saveCreds } = await useMultiFileAuthState(dir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({ version, auth: state, logger: pino({ level: 'silent' }) });
    s.sock = sock;
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      if (qr) s.qr = await QRCode.toDataURL(qr, { margin: 1, width: 280 });
      if (connection === 'open') {
        s.ready = true;
        s.qr = null;
        console.log(`✅ WhatsApp linked for user ${userId.slice(0, 8)} as ${sock.user?.id?.split(':')[0]}`);
      }
      if (connection === 'close') {
        s.ready = false;
        s.starting = false;
        s.sock = null;
        const code = (lastDisconnect?.error as any)?.output?.statusCode;
        if (code === DisconnectReason.loggedOut) {
          // Unlinked from the phone (or via the app): wipe the session so a fresh QR is issued
          await fs.rm(dir, { recursive: true, force: true });
          s.qr = null;
        }
        const linkedBefore = Boolean(state.creds.registered);
        if (!linkedBefore && code !== DisconnectReason.restartRequired && Date.now() - s.lastSeen > IDLE_MS) {
          sessions.delete(userId); // nobody is waiting on this QR any more
          return;
        }
        // restartRequired (515) fires right after the first QR pairing; reconnect for it and transient drops
        setTimeout(() => connect(userId), 2000);
      }
    });
  } catch (error) {
    s.starting = false;
    console.error(`WhatsApp start error for user ${userId.slice(0, 8)}:`, error);
    setTimeout(() => connect(userId), 5000);
  }
}

function ensureSession(userId: string): Session {
  let s = sessions.get(userId);
  if (!s) {
    s = { sock: null, ready: false, qr: null, starting: false, lastSeen: Date.now() };
    sessions.set(userId, s);
    connect(userId);
  }
  return s;
}

// Called on boot: reconnect every user who already linked WhatsApp, so they are ready without visiting the page
export function restoreWhatsAppSessions() {
  if (!existsSync(SESSIONS_DIR)) return;
  for (const userId of readdirSync(SESSIONS_DIR)) {
    if (existsSync(path.join(SESSIONS_DIR, userId, 'creds.json'))) ensureSession(userId);
  }
}

// The first account adopts a WhatsApp session that was linked before accounts existed
export async function adoptLegacySession(userId: string) {
  if (!existsSync(path.join(LEGACY_DIR, 'creds.json'))) return;
  await fs.mkdir(SESSIONS_DIR, { recursive: true });
  await fs.rename(LEGACY_DIR, authDir(userId)).catch(() => {});
}

/** Whether the user's WhatsApp is linked right now, without starting a connection (for the admin Users page) */
export const isWhatsAppLinked = (userId: string) => Boolean(sessions.get(userId)?.ready);

export function getWhatsAppStatus(userId: string) {
  const s = ensureSession(userId);
  s.lastSeen = Date.now();
  if (!s.sock && !s.starting) connect(userId);
  return {
    ready: s.ready,
    qr: s.ready ? null : s.qr,
    user: s.ready ? s.sock?.user?.id?.split(':')[0]?.split('@')[0] ?? null : null,
  };
}

export async function sendWhatsAppText(userId: string, phone: string, message: string) {
  const s = sessions.get(userId);
  if (!s?.ready || !s.sock) {
    throw Object.assign(new Error('Your WhatsApp is not linked yet. Scan your QR code on the Send Messages page.'), { status: 503 });
  }

  const cleanNum = phone.replace(/[^0-9]/g, '');
  const [contact] = (await s.sock.onWhatsApp(cleanNum)) ?? [];
  if (!contact?.exists) {
    throw Object.assign(new Error(`+${cleanNum} is not on WhatsApp`), { status: 404 });
  }

  const result = await s.sock.sendMessage(contact.jid, { text: message });
  console.log(`✅ [${userId.slice(0, 8)}] Sent to ${cleanNum}: "${message.substring(0, 30)}..."`);
  return { messageId: result?.key.id, to: cleanNum };
}

export async function logoutWhatsApp(userId: string) {
  // logout() fires a loggedOut close, which wipes the session and issues a new QR
  await sessions.get(userId)?.sock?.logout().catch(() => {});
}
