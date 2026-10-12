# Database Guide

WA Direct Automation does **not** need a database server (no MySQL, PostgreSQL or MongoDB). All data is stored as files in the `data/` folder, which is created automatically on first run and is excluded from Git.

This guide explains where the data lives, how to check it, and what every "table" contains.

---

## 1. Where the data is stored

```
data/
├── users.json              ← "users" table (and each user's saved scenarios and messages)
├── session-secret          ← key that signs login cookies
└── wa-sessions/
    └── <user-id>/          ← each user's linked WhatsApp session (Baileys files)
        ├── creds.json
        └── ...             (pre-keys, sessions, app-state files)
```

To keep the data somewhere else, set `DATA_DIR` in `.env`:

```env
DATA_DIR="D:/wa-data"
```

---

## 2. How to check the data

### Option A: the built-in command (recommended)

Run these in the project folder. They are **read-only** and never print passwords, API keys or WhatsApp secrets.

| Command | Shows |
| :--- | :--- |
| `npm run db` | Summary: number of users, linked WhatsApp accounts, saved scenarios, and a table of all users |
| `npm run db -- user you@example.com` | One user's details, linked WhatsApp number and saved scenarios |
| `npm run db -- scenarios` | Every saved scenario with its owner |

Example output of `npm run db`:

```
Data folder: D:\Small Projects\WA-Direct-Automation\data
Users: 2   WhatsApp linked: 1   Saved scenarios: 3
┌───┬──────────────┬─────────────────┬─────────────────┬──────────┬─────────────────┬───────────┬──────────────────────┐
│   │ name         │ email           │ phone           │ role     │ whatsapp        │ scenarios │ created              │
├───┼──────────────┼─────────────────┼─────────────────┼──────────┼─────────────────┼───────────┼──────────────────────┤
│ 0 │ 'Rahul Sharma' │ 'rahul@test.com' │ '+919876543210' │ 'owner'  │ '+919876543210' │ 3         │ '11/10/2026, 9:54 pm' │
│ 1 │ 'Neha Gupta' │ 'neha@test.com' │ '+919811122334' │ 'member' │ '—'             │ 0         │ '11/10/2026, 9:56 pm' │
└───┴──────────────┴─────────────────┴─────────────────┴──────────┴─────────────────┴───────────┴──────────────────────┘
```

### Option B: open the file in VS Code

Open `data/users.json`. It is formatted JSON, so you can read it directly. **Do not edit it while the server is running**; the server may overwrite your change.

### Option C: PowerShell

```powershell
# List users without secrets
Get-Content data/users.json | ConvertFrom-Json | Select-Object name, email, phone, role, createdAt | Format-Table

# Count users
(Get-Content data/users.json | ConvertFrom-Json).Count

# Which users have linked WhatsApp (folders that contain creds.json)
Get-ChildItem data/wa-sessions -Directory | Where-Object { Test-Path "$($_.FullName)/creds.json" } | Select-Object Name
```

---

## 3. Tables

The data is not in SQL tables, but it is organised like this:

```
users (1) ──< scenarios (many)        stored inside each user record
users (1) ──< savedMessages (many)    stored inside each user record
users (1) ──  wa_session (0 or 1)     folder data/wa-sessions/<users.id>/
```

### 3.1 `users` (file: `data/users.json`)

A JSON array; each element is one account.

| Field | Type | Required | Description | Example |
| :--- | :--- | :---: | :--- | :--- |
| `id` | string (UUID v4) | ✅ | Unique user ID. Also the name of the user's WhatsApp session folder. | `5652ae45-ce9e-4fbb-9d22-2e4d2e297525` |
| `name` | string (2–60) | ✅ | Full name entered at sign-up. | `Rahul Sharma` |
| `email` | string (≤120) | ✅ | Login email, stored in lowercase. **Unique.** | `rahul@example.com` |
| `phone` | string (10–15 digits) | ✅ | Mobile number with country code, digits only (E.164 without `+`). **Unique.** | `919876543210` |
| `role` | `"owner"` \| `"member"` | ✅ | The first account is `owner`; later accounts are `member`. | `owner` |
| `passwordHash` | string | ✅ | scrypt hash in the form `scrypt$<salt-hex>$<hash-hex>`. The password itself is never stored. | `scrypt$9f1c…$4ab2…` |
| `apiKey` | string | ✅ | Personal API key for scripts (`Authorization: Bearer <key>`). Starts with `wad_`. **Secret.** | `wad_Xk3…` |
| `createdAt` | string (ISO 8601) | ✅ | When the account was created. | `2026-10-11T16:24:50.123Z` |
| `scenarios` | array of `scenarios` | – | The user's saved AI Composer scenarios (see below). | `[ … ]` |
| `savedMessages` | array of `savedMessages` | – | Saved messages and AI Composer history, listed on the Send Messages page (see below). | `[ … ]` |

Example record (secrets shortened):

```json
{
  "id": "5652ae45-ce9e-4fbb-9d22-2e4d2e297525",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "919876543210",
  "role": "owner",
  "passwordHash": "scrypt$9f1c2e…$4ab2d0…",
  "apiKey": "wad_Xk3…",
  "createdAt": "2026-10-11T16:24:50.123Z",
  "scenarios": [
    {
      "id": "9f12ca89-bae5-44e2-a15b-73dadf1640ec",
      "name": "Appointment reminder",
      "instructions": "Remind about the appointment tomorrow at 4 PM and ask to reply YES."
    }
  ]
}
```

### 3.2 `scenarios` (inside each user: `users[].scenarios`)

| Field | Type | Required | Description | Example |
| :--- | :--- | :---: | :--- | :--- |
| `id` | string (UUID v4) | ✅ | Unique scenario ID. | `9f12ca89-…` |
| `name` | string (2–50) | ✅ | Label shown in the Purpose dropdown. Unique per user (case-insensitive). | `Appointment reminder` |
| `instructions` | string (5–600) | ✅ | What the AI should write; sent as the message intent. | `Remind about the appointment…` |

Limit: 30 scenarios per user.

### 3.3 `savedMessages` (inside each user: `users[].savedMessages`)

Newest first. Every AI Composer generation is added automatically as an **AI history** entry (`pinned: false`). Clicking **Send this message** in the AI Composer, or **Save** on the Send Messages page, saves it for good (`pinned: true`).

| Field | Type | Required | Description | Example |
| :--- | :--- | :---: | :--- | :--- |
| `id` | string (UUID v4) | ✅ | Unique message ID. | `3b7e0c1d-…` |
| `title` | string (≤60) | ✅ | Name shown in the message dropdown. Defaults to the first line of the text. | `Hello Rahul! 🙏` |
| `text` | string (1–4000) | ✅ | The message, with WhatsApp formatting (`*bold*`, `_italic_`, …). Unique per user. | `Hello *Rahul*! …` |
| `source` | `"ai"` \| `"manual"` | ✅ | `ai` = from the AI Composer, `manual` = saved from the editor. | `ai` |
| `pinned` | boolean | – | `false` = AI history entry. `true` or missing = saved by the user. | `false` |
| `createdAt` | string (ISO 8601) | ✅ | When it was added. | `2026-10-12T15:20:00.000Z` |

Limits: 50 saved messages per user. Only the latest 20 AI history entries are kept; older ones are removed automatically. Demo output (shown when `NVIDIA_API_KEY` is missing) is never stored.

### 3.4 `wa_sessions` (folder: `data/wa-sessions/<user-id>/`)

One folder per user who has opened Send Messages. Created and managed by the Baileys library; **do not edit these files**.

| File | Description |
| :--- | :--- |
| `creds.json` | Device credentials. `me.id` contains the linked WhatsApp number; `registered: true` once linked. **Secret.** |
| `pre-key-*.json`, `session-*.json`, `app-state-*.json`, … | Encryption keys and sync state for the linked device. **Secret.** |

- No folder, or no `creds.json` → the user has not linked WhatsApp yet.
- Deleting a user's folder unlinks them; they will get a new QR code on the Send Messages page.

### 3.5 `session_secret` (file: `data/session-secret`)

| Content | Description |
| :--- | :--- |
| 96 hex characters | Key that signs the `wa_session` login cookie (HMAC-SHA256). Generated on first run unless `SESSION_SECRET` is set in `.env`. |

Changing or deleting it logs **all** users out (their passwords and data are unaffected).

### 3.6 Login sessions (not stored)

Logins are stateless signed cookies (`wa_session`, HttpOnly, SameSite=Lax, valid 7 days). They contain only the user ID and expiry, so there is no sessions table.

---

## 4. Common tasks

| Task | How |
| :--- | :--- |
| **Back up** | Stop the server, then copy the whole `data/` folder. |
| **Restore** | Stop the server, replace `data/` with the backup, start the server. |
| **Delete a user** | Stop the server, remove their object from `data/users.json`, and delete `data/wa-sessions/<their-id>/`. |
| **Unlink one user's WhatsApp** | Use **Unlink** on Send Messages, or delete `data/wa-sessions/<their-id>/`. |
| **Log everyone out** | Delete `data/session-secret` and restart. |
| **Start fresh (deletes everything)** | Stop the server and delete the `data/` folder. |
| **Close new sign-ups** | Set `ALLOW_REGISTRATION=false` in `.env` and restart. |

---

## 5. Security notes

- `data/` is in `.gitignore`. Never commit it or share it: it contains password hashes, API keys and WhatsApp sessions.
- Anyone with a user's `apiKey` or WhatsApp session files can send messages from that user's number.
- Passwords are hashed with scrypt and a random salt; even the owner cannot read them.

---

## 6. Moving to a real database later

The file store is ideal for a single server with up to a few hundred users. For more users, or several servers behind a load balancer, move to **SQLite** (single server, no setup) or **MySQL / PostgreSQL** (hosted, multiple servers). All data access is in `auth.ts` (`loadUsers`, `saveUsers`, `updateUser`, `getUserScenarios`, `getUserMessages`), so only that file needs to change.

Equivalent SQL schema (MySQL syntax):

```sql
CREATE TABLE users (
  id            CHAR(36)     PRIMARY KEY,
  name          VARCHAR(60)  NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  phone         VARCHAR(15)  NOT NULL UNIQUE,
  role          ENUM('owner', 'member') NOT NULL DEFAULT 'member',
  password_hash VARCHAR(255) NOT NULL,
  api_key       VARCHAR(64)  NOT NULL UNIQUE,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scenarios (
  id           CHAR(36)     PRIMARY KEY,
  user_id      CHAR(36)     NOT NULL,
  name         VARCHAR(50)  NOT NULL,
  instructions VARCHAR(600) NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_scenario (user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE saved_messages (
  id         CHAR(36)      PRIMARY KEY,
  user_id    CHAR(36)      NOT NULL,
  title      VARCHAR(60)   NOT NULL,
  text       VARCHAR(4000) NOT NULL,
  source     ENUM('ai', 'manual') NOT NULL,
  pinned     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

WhatsApp session files can stay on disk (or move to a key-value table) independently of the users table.
