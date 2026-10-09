# WA Direct Automation 🚀
### Send WhatsApp Messages Without Meta Account, Paid Platforms, or Browser Windows

**WA Direct Automation** is an open-source WhatsApp message automation suite and script generator designed to send WhatsApp messages **without** requiring a Meta Developer Account, Facebook Business Manager, credit card, paid third-party platforms (like Twilio, Wati), or opening WhatsApp Web in Google Chrome.

---

## 🌟 Key Highlights

- **NVIDIA NIM AI Integration**: Powered by NVIDIA's high-speed inference microservices (Llama 3.3 70B, Nemotron 70B, DeepSeek R1) for 24/7 intelligent auto-replies and message generation.
- **Zero Meta Cloud API**: No Facebook Developer portal, no business verification, no credit card.
- **No WhatsApp Web Browser Window**: Uses headless WebSocket protocol (Baileys) or Android hardware automation (ADB). No Chrome window pops up.
- **₹0 Cost**: 100% free and open-source.
- **Interactive Web App**: Includes a live message dispatcher, bulk queue sender, NVIDIA AI Studio, and real-time script generator built with React 19, TypeScript, Express, and Tailwind CSS.
- **Multiple Integration Methods**:
  1. **NVIDIA NIM AI + WhatsApp Bot**: Intelligent 24/7 conversational auto-reply bot.
  2. **Headless Socket (Baileys)**: Background daemon, ultra-lightweight (<40MB RAM).
  3. **Local Private REST API**: Run a microservice on your machine and send messages with a 1-line `curl` command.
  4. **Android Direct ADB**: Control your physical Android phone's official WhatsApp app via USB or Wi-Fi.
  5. **Android Termux**: Run standalone scripts directly inside your mobile phone.
  6. **Direct Universal URL**: Universal WhatsApp deep-link protocol (`wa.me` / `api.whatsapp.com`).

---

## 🧠 NVIDIA NIM AI Integration

You can integrate state-of-the-art AI models from **[NVIDIA Build](https://build.nvidia.com)** with your WhatsApp client without any Meta developer account:

### 1. Get Free NVIDIA API Key
1. Visit [build.nvidia.com](https://build.nvidia.com) and sign in.
2. Generate an API Key (starts with `nvapi-...`). You receive free API inference credits.
3. Add it to your `.env` file:
   ```env
   NVIDIA_API_KEY="nvapi-YOUR_KEY_HERE"
   ```

### 2. Supported NVIDIA NIM Models
- `meta/llama-3.3-70b-instruct` (Flagship model with superb Hindi, Hinglish, and English fluency)
- `nvidia/llama-3.1-nemotron-70b-instruct` (NVIDIA's customized model for high-accuracy customer service)
- `deepseek-ai/deepseek-r1` (Advanced reasoning)
- `mistralai/mixtral-8x22b-instruct` (Fast multilingual model)

### 3. Run the WhatsApp + NVIDIA AI Auto-Reply Bot
```bash
# Install dependencies
npm install @whiskeysockets/baileys qrcode-terminal pino dotenv

# Run the bot
node whatsapp_nvidia_ai_bot.js
```
The bot connects in the background, listens for incoming WhatsApp messages, queries NVIDIA NIM, and sends context-aware replies in under 1 second!

---

## 🏗️ Architecture & How It Works

WhatsApp operates on an end-to-end encrypted protocol. This project provides three completely free ways to interface with it without Meta API:

```
+-----------------------------------------------------------------------------------+
|                            WA Direct Automation                                   |
+-----------------------------------------------------------------------------------+
       |                                      |                               |
       v                                      v                               v
[Method 1: Headless Socket]        [Method 2: Local REST API]     [Method 3: Android ADB]
Baileys WebSocket Client           Express.js Gateway on Port 4000 Android Debug Bridge
Connects directly to WhatsApp      Trigger via 1-Line cURL/POST    Controls Phone App over
Servers behind the scenes          No Browser UI, Pure API         USB/WiFi with No Web
```

---

## 🚀 Quick Start & Installation

### 1. Run the Web Interface (UI & Generator)
```bash
# Clone the repository
git clone https://github.com/BanshwarTech/WA-Direct-Automation.git
cd WA-Direct-Automation

# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Automation Methods & Code Examples

### Method 1: Pure Headless Socket (Baileys) — No Browser UI

Connects directly to WhatsApp WebSocket servers in the background.

```bash
mkdir direct-wa
cd direct-wa
npm init -y
npm install @whiskeysockets/baileys qrcode-terminal pino
```

Create `send_direct.js`:
```javascript
const {
  default: makeWASocket,
  useMultiFileAuthState
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

const TARGET_PHONE = "919876543210"; // Country code + Number without '+'
const MESSAGE = "Hello! Direct WhatsApp message sent in background without browser!";

async function run() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_session');
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, qr }) => {
    if (qr) {
      console.log('📲 Scan QR once in terminal (WhatsApp -> Linked Devices):');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'open') {
      console.log('✅ Connected!');
      const jid = `${TARGET_PHONE}@s.whatsapp.net`;
      const res = await sock.sendMessage(jid, { text: MESSAGE });
      console.log('🎉 Sent! Message ID:', res.key.id);
      setTimeout(() => process.exit(0), 1500);
    }
  });
}

run();
```

Run:
```bash
node send_direct.js
```

---

### Method 2: Local Private REST API Gateway (1-Line cURL Trigger)

Run your own self-hosted private WhatsApp API server on your local machine:

Create `server.js`:
```javascript
const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

const app = express();
app.use(express.json());
let sock, isReady = false;

async function init() {
  const { state, saveCreds } = await useMultiFileAuthState('./api_auth');
  sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }) });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', ({ connection, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === 'open') {
      isReady = true;
      console.log('🚀 Local WhatsApp Gateway running at http://localhost:4000');
    }
  });
}
init();

app.post('/send-message', async (req, res) => {
  if (!isReady) return res.status(503).json({ error: 'Gateway not ready' });
  const { phone, message } = req.body;
  const jid = `${phone.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
  const result = await sock.sendMessage(jid, { text: message });
  res.json({ success: true, id: result.key.id });
});

app.listen(4000);
```

Once running, send messages from **ANY** terminal, Python script, or cron job with **1 line**:
```bash
curl -X POST http://localhost:4000/send-message \
     -H "Content-Type: application/json" \
     -d '{"phone": "919876543210", "message": "Instant direct delivery!"}'
```

---

### Method 3: Android Direct ADB (Control Phone Hardware over USB/Wi-Fi)

Trigger your physical phone's original WhatsApp application without touching WhatsApp Web:

```bash
#!/usr/bin/env bash
PHONE="919876543210"
MESSAGE="Sent directly via Android phone app"

adb shell am start -a android.intent.action.VIEW \
    -d "https://api.whatsapp.com/send?phone=$PHONE&text=$MESSAGE" \
    com.whatsapp

sleep 1.5
adb shell input keyevent 22 # Focus send button
adb shell input keyevent 66 # Press enter / send
```

---

## 🛡️ Anti-Ban Safety Rules (Best Practices)

When automating WhatsApp without Meta's Cloud API:
1. **Random Delay**: Add a 3 to 8 second delay between messages. Never fire 50 messages in 1 second.
2. **Warm-up Numbers**: Start with 15–20 messages per day on new numbers before scaling.
3. **Personalization**: Avoid sending identical spam text. Use dynamic variables like `{name}` or `{order_id}`.
4. **Known Contacts**: Sending to users who have previously saved your number or chatted with you carries virtually 0 ban risk.
5. **Opt-Out**: Do not send unsolicited messages to strangers who may report or block your account.

---

## 📊 Comparison Matrix

| Feature | Official Meta Cloud API | Baileys Headless Socket | Local REST API | Android ADB |
| :--- | :--- | :--- | :--- | :--- |
| **Meta Account Required?** | ❌ YES (Strict Verification) | ✅ NO (0% Meta) | ✅ NO (0% Meta) | ✅ NO (0% Meta) |
| **Cost per message** | ❌ Paid (~₹0.50 - ₹1.50) | ✅ 100% Free | ✅ 100% Free | ✅ 100% Free |
| **Browser Window Opens?** | ✅ No (REST API) | ✅ No (Headless Socket) | ✅ No (Local API) | ✅ No (Direct Phone) |
| **Setup Time** | Days / Weeks | 2 Minutes | 2 Minutes | 1 Minute |
| **Multimedia (Images/PDFs)** | Supported | Fully Supported | Fully Supported | Supported via Intent |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend / Protocol**: Node.js, Express, @whiskeysockets/baileys, Pino
- **Build Tool**: Vite

---

## 📄 License

MIT License. Free for personal, commercial, and educational use.
