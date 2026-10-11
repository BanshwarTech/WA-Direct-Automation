// Read-only inspector for the app's file-based data store (data/ by default, or DATA_DIR).
// Never prints password hashes, API keys or WhatsApp session secrets.
//
//   npm run db                    summary + users table
//   npm run db -- user <email>    one user's details and saved scenarios
//   npm run db -- scenarios       every saved scenario

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ quiet: true } as dotenv.DotenvConfigOptions);

const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_DIR = path.join(DATA_DIR, 'wa-sessions');

interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'owner' | 'member';
  createdAt: string;
  scenarios?: { id: string; name: string; instructions: string }[];
}

function loadUsers(): StoredUser[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

// Linked WhatsApp number from the Baileys session (creds.json → me.id), or null if not linked
function linkedNumber(userId: string): string | null {
  const credsFile = path.join(SESSIONS_DIR, userId, 'creds.json');
  if (!fs.existsSync(credsFile)) return null;
  try {
    const creds = JSON.parse(fs.readFileSync(credsFile, 'utf-8'));
    const id: string | undefined = creds?.me?.id;
    return creds?.registered || id ? (id ? `+${id.split(':')[0].split('@')[0]}` : 'linked') : null;
  } catch {
    return null;
  }
}

const date = (iso: string) => (iso ? new Date(iso).toLocaleString() : '');

const [cmd, arg] = process.argv.slice(2);
const users = loadUsers();

console.log(`\nData folder: ${DATA_DIR}`);
if (!fs.existsSync(USERS_FILE)) {
  console.log('No users yet (data/users.json does not exist). Create an account at /register first.\n');
  process.exit(0);
}

if (cmd === 'user') {
  const u = users.find((x) => x.email === String(arg ?? '').toLowerCase());
  if (!u) {
    console.log(`No user with email "${arg}".\n`);
    process.exit(1);
  }
  console.table({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ? `+${u.phone}` : '',
    role: u.role,
    created: date(u.createdAt),
    whatsapp: linkedNumber(u.id) ?? 'not linked',
    scenarios: u.scenarios?.length ?? 0,
  });
  if (u.scenarios?.length) console.table(u.scenarios.map((s) => ({ name: s.name, instructions: s.instructions.slice(0, 70) })));
} else if (cmd === 'scenarios') {
  const rows = users.flatMap((u) => (u.scenarios ?? []).map((s) => ({ user: u.email, name: s.name, instructions: s.instructions.slice(0, 60) })));
  console.log(`\nScenarios (${rows.length})`);
  rows.length ? console.table(rows) : console.log('None saved yet.');
} else {
  const linked = users.filter((u) => linkedNumber(u.id)).length;
  console.log(`Users: ${users.length}   WhatsApp linked: ${linked}   Saved scenarios: ${users.reduce((n, u) => n + (u.scenarios?.length ?? 0), 0)}`);
  console.table(
    users.map((u) => ({
      name: u.name,
      email: u.email,
      phone: u.phone ? `+${u.phone}` : '',
      role: u.role,
      whatsapp: linkedNumber(u.id) ?? '—',
      scenarios: u.scenarios?.length ?? 0,
      created: date(u.createdAt),
    }))
  );
  console.log('Details: npm run db -- user <email>   |   All scenarios: npm run db -- scenarios\n');
}
