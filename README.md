# 🚀 WA Direct Automation + NVIDIA NIM AI Suite
### Send WhatsApp Messages & 24/7 AI Auto-Replies Without Meta Account, Paid Platforms, or Browser Windows

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Node: >=18](https://img.shields.io/badge/Node-%3E%3D18.0.0-blue.svg)](https://nodejs.org)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA-NIM%20AI-76B900.svg)](https://build.nvidia.com)
[![Protocol: Baileys](https://img.shields.io/badge/Protocol-Baileys%20Multi--Device-25D366.svg)](https://github.com/WhiskeySockets/Baileys)
[![Docs: Database guide](https://img.shields.io/badge/Docs-Database%20Guide-0a1f33.svg)](DATABASE.md)

> 📚 **Documentation**
> - **[Database Guide (DATABASE.md)](DATABASE.md)**: where data is stored, every table and field, how to check data with `npm run db`, backups and resets
> - **Setup, accounts and API**: see the sections below

---

## 📖 Overview

**WA Direct Automation** is a complete open-source WhatsApp automation toolkit and script hub. It lets you send WhatsApp messages directly in the background **without a Meta Developer Account**, without Facebook Business Manager, without a credit card, and **without opening Google Chrome or a WhatsApp Web page**. It also provides 24/7 smart auto-replies powered by **NVIDIA NIM AI (Nemotron 3)**.

---

## ✨ Key Features

- 🚫 **Zero Meta Cloud API**: No Facebook App ID, business verification, or per-message fees required.
- 🚫 **No WhatsApp Web Browser UI**: Google Chrome or web.whatsapp.com never opens on screen (100% headless socket protocol).
- 🧠 **NVIDIA NIM AI 24/7 Auto-Reply**: Whenever a customer asks a question on WhatsApp, NVIDIA's **Nemotron 3 Super** (or **Nemotron 3 Ultra**) model automatically sends an accurate reply within seconds.
- ⚡ **Local Private REST API**: Send a message at any time from your own computer with a single-line `curl` command.
- 📱 **Android Direct ADB**: Send directly through the official WhatsApp app on a real Android phone connected to your computer.
- 📊 **Interactive Web Studio**: A modern React 19 dashboard with a bulk message queue, live message generator, and template variables (`{name}`).
- 🛡️ **Anti-Ban Protection**: Built-in random delays and warm-up strategies to keep your number safe.

---

## 🖥️ Local Machine Setup Guide

Follow the steps below to run this project on your Windows, macOS, or Linux computer:

### Prerequisites:
- **Node.js**: v18.0.0 or newer (download from [nodejs.org](https://nodejs.org))
- **Git**: ([git-scm.com](https://git-scm.com))
- Your regular **Android or iPhone** with WhatsApp installed and active

---

### Step 1: Clone the Repository
Open a terminal (Terminal or PowerShell) and run the following commands:
```bash
git clone https://github.com/BanshwarTech/WA-Direct-Automation.git
cd WA-Direct-Automation
```

---

### Step 2: Install Dependencies
```bash
npm install
```

---

### Step 3: Environment Configuration
Create the `.env` file in the project root:
```bash
cp .env.example .env
```
Now open the `.env` file and add your NVIDIA API key:
```env
# NVIDIA NIM AI Key (get it for free from https://build.nvidia.com)
NVIDIA_API_KEY="nvapi-YOUR_NVIDIA_KEY_HERE"

# App Port (Default: 3000)
PORT=3000

# Bind address (Default: 127.0.0.1, local access only)
# HOST=0.0.0.0
```
> ⚠️ The server listens on `127.0.0.1` by default. Setting `HOST=0.0.0.0` exposes it on your network, and anyone on that network could then send messages from the linked WhatsApp number. Only do this on a trusted network.

> 💡 **How to get a free NVIDIA API key:**
> 1. Go to [https://build.nvidia.com](https://build.nvidia.com) and create a free account.
> 2. Open the `nvidia/nemotron-3-super-120b-a12b` model page and click **Get API Key**.
> 3. You receive 1000 free API credits immediately!

---

### Step 4: Start the Web Dashboard
```bash
npm run dev
```
Now open this address in your browser: **[http://localhost:3000](http://localhost:3000)**

The web app has these pages:
- **Home**: An overview of what the app does and how it works.
- **Send Messages**: Link WhatsApp with a QR code, then send to one number or a whole list (bulk sending with personalized `{name}` messages).
- **AI Composer**: Have NVIDIA AI write a message for any purpose (payment reminder, sales offer, order update).
- **Scripts**: Customize and download standalone automation scripts (AI auto-reply bot, Android ADB, Python, and more).
- **Help**: Troubleshooting, anti-ban guidelines, and FAQ.

---

### Accounts and sending messages from the web app

Sending requires a free account, and **every account links its own WhatsApp** with its own QR code, so messages always go out from that user's number.

1. Open [http://localhost:3000](http://localhost:3000) and click **Get started** (or open **Send Messages**, which redirects you to sign-up).
2. Create an account with your name, mobile number, email and password.
3. On **Send Messages**, scan your personal QR code from WhatsApp > **Linked Devices** > **Link a Device**.
4. Enter the recipient's number and your message, then click **Send Message**. In **Bulk Queue**, **Send All** sends the whole list with a random 3–8 second delay between messages.

Where data is stored (all inside `data/`, which is gitignored). See **[DATABASE.md](DATABASE.md)** for every field, how to check the data (`npm run db`), backups and resets:

| Path | Contents |
| :--- | :--- |
| `data/users.json` | Accounts. Passwords are hashed with scrypt; they are never stored in plain text. |
| `data/session-secret` | Key that signs login cookies (generated on first run unless `SESSION_SECRET` is set). |
| `data/wa-sessions/<user-id>/` | Each user's linked WhatsApp session, so nobody has to rescan after a restart. |

Optional `.env` settings:

```env
# Close public sign-up (the first account can always be created)
ALLOW_REGISTRATION=false
# Fixed cookie-signing key (32+ characters); otherwise one is generated in data/
SESSION_SECRET="a-long-random-string-of-at-least-32-characters"
# Store accounts and sessions somewhere else
DATA_DIR="./data"
```

If you used the app before accounts existed, the first account you create automatically takes over the WhatsApp session in `./gateway_auth`.

---

## 🤖 How to Run the 24/7 AI WhatsApp Auto-Reply Bot

> **Note:** `whatsapp_nvidia_ai_bot.js` is not included in the repository. Generate and download it from the **Scripts** page of the web app.

If you want your computer to stay on day and night, with **NVIDIA Nemotron 3 AI** replying to every customer message that arrives on your WhatsApp:

```bash
# 1. Install the required packages
npm install @whiskeysockets/baileys qrcode-terminal pino dotenv

# 2. Start the bot
node whatsapp_nvidia_ai_bot.js
```

### How to link the QR code the first time:
1. A QR code appears in the terminal.
2. Open WhatsApp on your phone:
   - **Android**: Tap the 3 dots in the top-right corner > **Linked Devices** > **Link a Device**
   - **iPhone**: **Settings** > **Linked Devices** > **Link a Device**
3. Scan the QR code shown in the terminal.
4. **Done!** Your login credentials are saved in the `./nvidia_bot_session` folder, so you never need to scan the QR code again.
5. From now on, whenever anyone messages your WhatsApp, NVIDIA AI replies immediately.

---

## 📡 How to Run the Private Local REST API Server

If you want to send WhatsApp messages directly from your website, Python script, PHP backend, or any other software:

### Built-in REST API (recommended)
The web app server exposes a REST API on the same port as the dashboard. Keep `npm run dev` running, log in, and link your WhatsApp on the **Send Messages** page first.

**Authentication:** every API request needs your personal API key, shown on the **Scripts** page (where you can also regenerate it). Send it as `Authorization: Bearer <key>` (or `X-API-Key: <key>`). Messages sent with a key go out from that account's linked WhatsApp. State-changing requests must use `Content-Type: application/json`.

| Method | Endpoint | Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wa/status` | none | Link status: `{ ready, user, qr }` (`qr` is a PNG data URL while not linked) |
| `POST` | `/api/wa/send` | `{ "phone": "919876543210", "message": "..." }` | Sends a text message. `phone` must include the country code, digits only |
| `POST` | `/api/wa/logout` | none | Unlinks WhatsApp and issues a new QR code |
| `POST` | `/api/nvidia/compose` | `{ intent, recipientName, language, tone, model }` | Drafts a WhatsApp message with AI |
| `POST` | `/api/nvidia/chat` | `{ prompt }` or `{ messages }`, optional `model` | Generates an AI reply to a customer message |

A successful send returns `{ "success": true, "messageId": "...", "to": "919876543210" }`. Errors return a JSON `error` field with status `400` (missing fields), `401` (missing or invalid API key), `404` (number not on WhatsApp), `415` (body is not JSON), or `503` (WhatsApp not linked yet).

**cURL**
```bash
curl -X POST http://localhost:3000/api/wa/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"phone": "919876543210", "message": "Your order has been dispatched."}'
```

**Python**
```python
import requests

res = requests.post("http://localhost:3000/api/wa/send", headers={"Authorization": "Bearer YOUR_API_KEY"}, json={
    "phone": "919876543210",
    "message": "Your order has been dispatched.",
})
print(res.json())
```

**Node.js**
```js
const res = await fetch("http://localhost:3000/api/wa/send", {
  method: "POST",
  headers: { "Authorization": "Bearer YOUR_API_KEY", "Content-Type": "application/json" },
  body: JSON.stringify({ phone: "919876543210", message: "Your order has been dispatched." }),
});
console.log(await res.json());
```

> `GET /sitemap.xml` and `GET /robots.txt` are generated by the server. Set `APP_URL` in `.env` (for example `APP_URL="https://wa.example.com"`) so they use your public domain; otherwise they use the address the request came in on.

> The server listens on `127.0.0.1` only. Setting `HOST=0.0.0.0` exposes it to your network, and anyone on that network could then send messages from your linked number.

### Standalone server

> **Note:** `whatsapp_local_api_server.js` is not included in the repository. Generate and download it from the **Scripts** page of the web app.

### 1. Start the local server:
```bash
node whatsapp_local_api_server.js
```
This starts a private API server on your computer at `http://localhost:4000`.

### 2. Send a message with a one-line cURL command:
```bash
curl -X POST http://localhost:4000/send-message \
     -H "Content-Type: application/json" \
     -d '{
       "phone": "919876543210",
       "message": "Hello! This message was sent through the local API gateway."
     }'
```

### 3. Call it from Python:
```python
import requests

response = requests.post("http://localhost:4000/send-message", json={
    "phone": "919876543210",
    "message": "Order confirmed! Thank you."
})
print(response.json())
```

---

## 📱 Android Phone Direct Hardware (ADB) Method

> **Note:** `send_via_android_adb.sh` is not included in the repository. Generate and download it from the **Scripts** page of the web app.

If you do not want to run Node.js on your computer and prefer to automate through the real WhatsApp app on your phone:
1. Turn on **Developer Options > USB Debugging** on the phone.
2. Connect the phone to your PC with a USB cable or over Wi-Fi.
3. Run the script:
```bash
bash send_via_android_adb.sh
```
This makes your phone's real WhatsApp app type and send the message on its own screen!

---

## ☁️ 24/7 Background Deployment (with PM2)

If you want to keep this bot running in the background on your laptop or Linux VPS, so it keeps running even after you close the terminal:

```bash
# Install the PM2 process manager
npm install -g pm2

# Start the NVIDIA AI Bot in the background
pm2 start whatsapp_nvidia_ai_bot.js --name "wa-nvidia-bot"

# Enable auto-restart (the bot also starts itself after a system reboot)
pm2 startup
pm2 save

# View logs
pm2 logs wa-nvidia-bot
```

---

## 🛡️ Anti-Ban Safety Rules

Always follow these 5 rules when automating without the Meta API:
1. **Random Delay**: Keep a gap of 3 to 8 seconds between messages. Never send 50 messages in 1 second.
2. **Warm-Up**: On a new number, send 10-20 messages on day one and 30-40 messages on day two.
3. **Personalization**: Instead of sending identical text to hundreds of people, use variables such as `{name}`.
4. **Opt-in Contacts**: Message only people who have saved your number or have chatted with you before.
5. **Avoid Spam**: Do not cold-message unwanted strangers, who may 'Report & Block' your chat.

---

## 🛠️ Tech Stack & Dependencies

| Component | Technology | Version |
| :--- | :--- | :--- |
| **Frontend Framework** | React | 19.x (Latest) |
| **Bundler & Server** | Vite & Express | Vite 8.x / Express 4.x / 5.x |
| **Language** | TypeScript | 7.x (Latest) |
| **Styling** | Tailwind CSS | 4.x (Latest) |
| **WhatsApp Protocol** | @whiskeysockets/baileys | Multi-Device WebSocket |
| **AI Inference** | NVIDIA NIM API | OpenAI-Compatible (`/v1`) |

---

## ❓ Frequently Asked Questions

**Q: Does the phone need to stay online after scanning the QR code?**  
A: No. Thanks to WhatsApp's Multi-Device architecture, once linked, the backend script keeps working directly with WhatsApp servers for up to 14 days even if your phone is switched off.

**Q: Can I send images or PDFs?**  
A: Yes! Baileys fully supports sending images with `sock.sendMessage(jid, { image: { url: ... }, caption: "..." })`, as well as documents and PDFs.

**Q: What should I do if the session gets logged out?**  
A: Delete the `./nvidia_bot_session` folder, run `node whatsapp_nvidia_ai_bot.js` again, and scan a new QR code once. For the web app, delete the `./gateway_auth` folder and restart `npm run dev`.

---

## 📄 License

MIT License. Free for personal, commercial, and educational use.
Developed with ❤️ by [BanshwarTech](https://github.com/BanshwarTech).
