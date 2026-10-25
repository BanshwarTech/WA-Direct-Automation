# WA Direct Automation

WA Direct Automation is a self-hosted web app for sending WhatsApp messages from a linked WhatsApp account. It includes a React interface, an Express server, account-based access, and optional AI message composition.

## Features

- Link WhatsApp by scanning a QR code from WhatsApp's **Linked devices** screen.
- Compose and send messages, with reusable templates and message variables.
- Import contacts from spreadsheets and send messages to selected recipients.
- Optionally draft messages with NVIDIA NIM AI.
- Manage accounts, saved messages, scenarios, settings, and message plans.
- Store accounts and WhatsApp sessions locally; no external database is required.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Install and run on Windows

Open a terminal in the project folder and run:

```powershell
npm.cmd install
npm.cmd run dev
```

Then open [http://localhost:3000](http://localhost:3000). In PowerShell, `npm.cmd` avoids the `npm.ps1 cannot be loaded because running scripts is disabled` error without changing the Windows execution policy. In Command Prompt or another shell, the equivalent commands are `npm install` and `npm run dev`.

The server binds to `127.0.0.1` by default. If port 3000 is already in use, choose another port in PowerShell:

```powershell
$env:PORT = "3001"
npm.cmd run dev
```

## First-time setup

1. Register the first account. It becomes the owner account and is activated immediately.
2. Sign in and open **Settings** to configure any optional services.
3. Open the WhatsApp linking flow and scan its QR code using **WhatsApp → Linked devices → Link a device**.
4. Compose a message, choose recipients, and send.

Additional users must verify their email. Configure SMTP under **Settings → Email** before allowing other users to sign up.

## Available commands

| Command | Description |
| --- | --- |
| `npm.cmd run dev` | Start the development server |
| `npm.cmd run lint` | Run the TypeScript check |
| `npm.cmd run build` | Build the client and server for production |
| `npm.cmd run start` | Start the production server; run the build first |
| `npm.cmd run db` | Inspect local account and WhatsApp-link status |
| `npm.cmd run db -- user someone@example.com` | Inspect one account |
| `npm.cmd run db -- scenarios` | List saved scenarios |

Production starts on port 3000 by default. Set `PORT` before running `npm.cmd run start` to use a different port.

## Optional services and configuration

The server can start without third-party API credentials. Configure integrations in the owner account's **Settings** page, or provide environment variables in a `.env` file based on `.env.example`. Settings saved in the app take priority over corresponding `.env` values.

- **NVIDIA NIM** (`NVIDIA_API_KEY`): enables the AI Composer.
- **SMTP** (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`): sends sign-up verification and password-reset emails.
- **Razorpay** (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`): enables payment integration when paid plans are turned on.
- **Site URL** (`APP_URL`): set the public URL when deploying so email links and canonical URLs use the correct address.
- **Registration** (`ALLOW_REGISTRATION=false`): closes public sign-up; the first account can still be created.

`PORT`, `HOST`, `DATA_DIR`, and `SESSION_SECRET` are boot-time settings and must be configured through the environment. By default, the server only listens on localhost. Exposing it to a network or the public internet requires deliberate deployment and security configuration.

## Local data and backups

By default, account records, settings, the session-signing secret, and per-account WhatsApp sessions are stored under `data/`. This directory is ignored by Git and may contain sensitive credentials. Back it up securely if needed; do not commit it or `.env`.
