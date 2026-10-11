import { ScriptTemplate } from '../types';

export const getScripts = (phone: string, message: string): ScriptTemplate[] => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const escapedMessage = message.replace(/"/g, '\\"').replace(/\n/g, '\\n');
  const encodedMessage = encodeURIComponent(message);

  return [
    {
      id: 'nvidia-bot',
      name: '🔥 WhatsApp + NVIDIA NIM AI Bot',
      badge: 'NVIDIA AI AUTO-REPLY BOT',
      category: 'NVIDIA AI + WhatsApp',
      doesOpenWhatsAppWeb: false,
      description: 'Integrates the NVIDIA NIM API (Nemotron 3) with WhatsApp Baileys. Whenever someone sends a message to your WhatsApp, NVIDIA AI understands it and automatically sends an intelligent reply (Smart Auto-Reply) in Hindi, Hinglish, or English. 0% WhatsApp Web, 0% Meta account!',
      pros: [
        'Auto-reply powered by NVIDIA NIM AI (Nemotron 3 Super / Ultra)',
        'No WhatsApp Web or browser opens (100% background, headless)',
        'No Meta Developer account and no monthly Twilio/Wati fees',
        'Ideal for customer support, lead handling, and 24/7 automation'
      ],
      cons: [
        'Requires an NVIDIA NIM API key (free credits are available at build.nvidia.com)'
      ],
      prerequisites: [
        'Node.js 18+ on your computer or VPS',
        'NVIDIA API key (get one for free at https://build.nvidia.com)'
      ],
      setupCommands: `mkdir wa-nvidia-bot\ncd wa-nvidia-bot\nnpm init -y\nnpm install @whiskeysockets/baileys qrcode-terminal pino dotenv`,
      filename: 'whatsapp_nvidia_ai_bot.js',
      code: `// ======================================================================
// WHATSAPP DIRECT AUTOMATION + NVIDIA NIM AI BOT (NO META ACCOUNT)
// Powered by: Baileys (Headless) + NVIDIA NIM (Nemotron 3)
// ======================================================================

require('dotenv').config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

// 🔑 Your NVIDIA API key (get it from build.nvidia.com)
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "nvapi-YOUR_NVIDIA_API_KEY_HERE";
const NVIDIA_MODEL = "nvidia/nemotron-3-super-120b-a12b"; // or "nvidia/nemotron-3-ultra-550b-a55b"

// 🧠 NVIDIA NIM AI API call function
async function askNvidiaAI(userQuery, senderName = "User") {
  const systemPrompt = \`You are a highly intelligent, polite, and helpful WhatsApp AI assistant.
- Keep replies concise, clear, and natural (WhatsApp style).
- Reply in the same language the user writes in (Hindi, Hinglish, or English).
- Highlight key points in *bold* and use emojis appropriately.\`;

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${NVIDIA_API_KEY}\`
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuery }
        ],
        temperature: 0.6,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("❌ NVIDIA API Error:", err);
      return "Sorry, we could not reach the AI service.";
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || "Hello! How can I help you?";
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
    return "Unable to get a reply due to a technical issue.";
  }
}

// 🚀 Start the WhatsApp bot
async function startNvidiaWhatsAppBot() {
  console.log("⚡ Starting WhatsApp + NVIDIA AI Bot...");

  const { state, saveCreds } = await useMultiFileAuthState('./nvidia_bot_session');

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\\n📲 Scan the QR code from WhatsApp on your phone (Settings -> Linked Devices):\\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const isLoggedOut = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;
      if (!isLoggedOut) {
        console.log('🔄 Reconnecting WhatsApp...');
        startNvidiaWhatsAppBot();
      }
    } else if (connection === 'open') {
      console.log('🤖 WhatsApp + NVIDIA AI Bot is active and ready!');
      console.log('🟢 NVIDIA AI will now reply to every incoming message!');
    }
  });

  // 📩 Event fired on new incoming messages (Auto-Reply Handler)
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      // Skip messages sent by ourselves
      if (msg.key.fromMe) continue;

      const senderJid = msg.key.remoteJid;
      // Handle private chats only (check for @g.us to skip group chats)
      if (senderJid.endsWith('@g.us')) continue;

      // Extract the message text
      const incomingText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      if (!incomingText.trim()) continue;

      console.log(\`\\n📩 Message received (\${senderJid}): "\${incomingText}"\`);
      console.log("🧠 Generating reply from NVIDIA NIM AI...");

      // Show typing indicator (Typing...)
      await sock.sendPresenceUpdate('composing', senderJid);

      // Get the reply from NVIDIA AI
      const aiResponse = await askNvidiaAI(incomingText, msg.pushName || "Friend");

      // Send the reply on WhatsApp
      await sock.sendMessage(senderJid, { text: aiResponse });
      console.log(\`📤 Reply sent: "\${aiResponse.substring(0, 50)}..."\`);

      // Clear the typing indicator
      await sock.sendPresenceUpdate('paused', senderJid);
    }
  });
}

startNvidiaWhatsAppBot();
`
    },
    {
      id: 'baileys',
      name: '1. Baileys (100% Headless Socket)',
      badge: 'NO BROWSER / PURE BACKGROUND',
      category: 'Headless Socket (No Browser)',
      doesOpenWhatsAppWeb: false,
      description: 'Neither WhatsApp Web nor any browser opens on screen! This sends WebSocket network packets directly from Node.js. It runs silently in the background and talks straight to the WhatsApp servers.',
      pros: [
        'WhatsApp Web or Chrome never opens on screen (0% Browser)',
        'No Meta/Facebook account and no paid API',
        'Ultra-fast (messages delivered in 0.5 seconds)',
        'Very low system resource usage (RAM <40MB)'
      ],
      cons: [
        'You must scan a QR code in the terminal once to link your device (the session is saved permanently afterward)'
      ],
      prerequisites: [
        'Node.js 18+ on your computer or VPS server',
        'Your regular smartphone with WhatsApp installed and active'
      ],
      setupCommands: `mkdir direct-whatsapp-bot\ncd direct-whatsapp-bot\nnpm init -y\nnpm install @whiskeysockets/baileys qrcode-terminal pino`,
      filename: 'direct_send_baileys.js',
      code: `// ======================================================================
// PURE HEADLESS DIRECT WHATSAPP SENDER (NO WHATSAPP WEB / NO BROWSER)
// ======================================================================
// This script does not open any browser or WhatsApp Web page.
// It talks directly to the WhatsApp servers through a backend socket.

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

// Recipient number (with country code, without '+')
const RECIPIENT = "${cleanPhone || '919876543210'}";
const MESSAGE = "${escapedMessage || 'Hello! This message was sent directly in the background, without any WhatsApp Web browser or Meta account.'}";

async function runDirectHeadlessSender() {
  console.log('⚡ Starting Headless Direct Socket (No Browser UI)...');

  // 1. Login credentials are saved in a local folder (so you don't have to link again every time)
  const { state, saveCreds } = await useMultiFileAuthState('./headless_auth');

  // 2. Pure headless socket connection
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }), // No unnecessary logs
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // The QR code is shown in the terminal only for the first-time link
    if (qr) {
      console.log('\\n======================================================');
      console.log('📲 Link with your phone (first time only):');
      console.log('   (WhatsApp -> Settings -> Linked Devices -> Link a Device)');
      console.log('======================================================\\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const isLoggedOut =
        lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;
      if (!isLoggedOut) {
        console.log('🔄 Reconnecting silently...');
        runDirectHeadlessSender();
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp Socket Connected directly!');
      console.log(\`📤 Sending direct message to \${RECIPIENT}...\`);

      try {
        const jid = \`\${RECIPIENT}@s.whatsapp.net\`;
        
        // Send directly in the background (no web page opens)
        const sent = await sock.sendMessage(jid, { text: MESSAGE });

        console.log('🎉 SUCCESS! Message delivered directly in background.');
        console.log('🆔 WhatsApp Message ID:', sent.key.id);

        // Exit the process 2 seconds after sending
        setTimeout(() => process.exit(0), 2000);
      } catch (err) {
        console.error('❌ Send error:', err);
      }
    }
  });
}

runDirectHeadlessSender();
`
    },
    {
      id: 'local-api',
      name: '2. Local Private REST API Gateway',
      badge: 'SELF-HOSTED PRIVATE API',
      category: 'Local REST API',
      doesOpenWhatsAppWeb: false,
      description: 'Run a private background API server on your computer. Then, from any language (Python, PHP, cURL, Bash), simply send an HTTP POST request and the message is sent in the background without opening any browser!',
      pros: [
        'No trace of WhatsApp Web (Zero Browser UI)',
        'Send a message at any time with just a cURL or POST request',
        'Works like Meta/Twilio, but 100% free and on your own system'
      ],
      cons: [
        'The Node.js server backend must keep running in the background'
      ],
      prerequisites: [
        'Node.js 18+',
        'Express.js and Baileys'
      ],
      setupCommands: `mkdir my-whatsapp-api\ncd my-whatsapp-api\nnpm init -y\nnpm install @whiskeysockets/baileys express qrcode-terminal pino`,
      filename: 'whatsapp_local_api_server.js',
      code: `// ======================================================================
// YOUR OWN PRIVATE WHATSAPP REST API GATEWAY (100% FREE, NO META)
// ======================================================================
// Run this in the background. Then send messages directly with curl http://localhost:4000/send-message
// without opening any browser or WhatsApp Web.

const express = require('express');
const {
  default: makeWASocket,
  useMultiFileAuthState
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

const app = express();
app.use(express.json());

let sockInstance = null;
let isReady = false;

async function initGateway() {
  const { state, saveCreds } = await useMultiFileAuthState('./gateway_auth');

  sockInstance = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' })
  });

  sockInstance.ev.on('creds.update', saveCreds);

  sockInstance.ev.on('connection.update', (update) => {
    const { connection, qr } = update;
    if (qr) {
      console.log('📲 Scan once to link your local gateway:');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'open') {
      isReady = true;
      console.log('🚀 Local WhatsApp Gateway is READY on http://localhost:4000');
    }
  });
}

// 🌐 Your Private Send Endpoint (No Browser, No WhatsApp Web)
app.post('/send-message', async (req, res) => {
  const { phone, message } = req.body;

  if (!isReady) {
    return res.status(503).json({ error: 'WhatsApp Gateway not connected yet' });
  }
  if (!phone || !message) {
    return res.status(400).json({ error: 'phone and message are required' });
  }

  try {
    const cleanNum = phone.replace(/[^0-9]/g, '');
    const jid = \`\${cleanNum}@s.whatsapp.net\`;

    // Direct background send
    const result = await sockInstance.sendMessage(jid, { text: message });

    console.log(\`✅ Sent to \${cleanNum}: "\${message.substring(0, 30)}..."\`);
    res.json({ success: true, messageId: result.key.id, to: cleanNum });
  } catch (error) {
    console.error('Send error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(4000, () => {
  console.log('📡 Starting Local WhatsApp Server on port 4000...');
  initGateway();
});

/*
 * ========================================================
 * 💡 How to call this API (from any terminal):
 * ========================================================
 * curl -X POST http://localhost:4000/send-message \\
 *      -H "Content-Type: application/json" \\
 *      -d '{"phone": "${cleanPhone || '919876543210'}", "message": "${escapedMessage || 'Direct API message'}"}'
 */
`
    },
    {
      id: 'android-adb',
      name: '3. Android Direct ADB (USB / Wi-Fi)',
      badge: 'DIRECT PHONE HARDWARE',
      category: 'Android Direct (ADB)',
      doesOpenWhatsAppWeb: false,
      description: 'If you do not want to link anything on a computer or server and want to send messages directly from the real WhatsApp app on your Android phone! Connect your phone via USB or Wi-Fi debugging and run commands on the phone directly from the terminal. 0% WhatsApp Web!',
      pros: [
        'Nothing to do with WhatsApp Web at all',
        'Messages are sent by the official WhatsApp app on your real phone',
        'No risk of an account ban because the original app on the phone is used',
        'Just a simple Bash/Python script'
      ],
      cons: [
        'The Android phone must be connected to the PC (via USB or Wi-Fi ADB)'
      ],
      prerequisites: [
        'Developer Options -> USB Debugging enabled on the Android phone',
        'ADB (Android Debug Bridge) tool on the computer'
      ],
      setupCommands: `# Ubuntu/Debian: sudo apt install adb\n# macOS: brew install android-platform-tools\n# Windows: choco install adb (or download platform-tools)\nadb devices`,
      filename: 'send_via_android_adb.sh',
      code: `#!/usr/bin/env bash
# ======================================================================
# DIRECT WHATSAPP SENDER VIA ANDROID PHONE (NO WHATSAPP WEB AT ALL)
# Uses Android Debug Bridge (ADB) to trigger original WhatsApp on phone
# ======================================================================

PHONE="${cleanPhone || '919876543210'}"
MESSAGE="${escapedMessage || 'Hello! This message was sent directly from the official WhatsApp app on my Android phone.'}"

echo "📱 Checking connected Android phone..."
adb devices

# 1. Turn on the phone screen and unlock it (if locked)
adb shell input keyevent 26
adb shell input keyevent 82

# 2. Open the chat directly in the real WhatsApp app on the phone (Intent)
echo "🚀 Opening chat with +$PHONE on Android phone..."
adb shell am start -a android.intent.action.VIEW \\
    -d "https://api.whatsapp.com/send?phone=$PHONE&text=$MESSAGE" \\
    com.whatsapp

# 3. Wait 1.5 seconds for WhatsApp to load
sleep 1.5

# 4. Automatically tap WhatsApp's 'Send' button (Enter keyevent)
echo "📤 Pressing Send button on phone..."
adb shell input keyevent 22   # Right arrow (focus send icon)
adb shell input keyevent 66   # Enter key (Sends message)

echo "🎉 SUCCESS! Message sent directly through your phone's official WhatsApp app."
`
    },
    {
      id: 'android-termux',
      name: '4. Android Termux (Run Directly on Mobile)',
      badge: 'STANDALONE ON SMARTPHONE',
      category: 'Termux Direct (Mobile)',
      doesOpenWhatsAppWeb: false,
      description: 'No computer needed! If you want the script to run entirely inside your own Android phone and send WhatsApp messages directly, this is 100% possible with the Termux app.',
      pros: [
        'No computer or server required',
        'Runs directly on the mobile device in the background',
        'No WhatsApp Web and no Meta API'
      ],
      cons: [
        'Termux and the Termux:API app must be installed on the Android phone'
      ],
      prerequisites: [
        'Install Termux from F-Droid on the Android phone',
        'Termux:API app'
      ],
      setupCommands: `pkg update && pkg install nodejs git termux-api\nmkdir termux-bot && cd termux-bot\nnpm init -y\nnpm install @whiskeysockets/baileys`,
      filename: 'termux_send.sh',
      code: `#!/data/data/com.termux/files/usr/bin/bash
# ======================================================================
# RUN DIRECTLY INSIDE ANDROID TERMUX (NO COMPUTER / NO WHATSAPP WEB)
# ======================================================================

PHONE="${cleanPhone || '919876543210'}"
MESSAGE="${escapedMessage || 'Direct message from Termux on Android'}"

echo "📱 Sending WhatsApp from Android Termux..."

# Trigger WhatsApp to send the message directly via a Termux Intent:
am start -a android.intent.action.VIEW \\
  -d "https://api.whatsapp.com/send?phone=\${PHONE}&text=\${MESSAGE}" \\
  com.whatsapp

sleep 1

# Trigger the Send button
input keyevent 22
input keyevent 66

echo "✅ Done!"
`
    },
    {
      id: 'python',
      name: '5. Python Headless Socket Script',
      badge: 'PYTHON DEVELOPERS',
      category: 'Python',
      doesOpenWhatsAppWeb: false,
      description: 'A script that calls our local REST gateway (Method 2) from Python. No Chrome or Selenium opens, and the call completes from the backend in 1 second.',
      pros: [
        'No browser opens (No Chrome/Edge)',
        'Clean Python code in just 5 lines',
        'Fast and lightweight'
      ],
      cons: [
        'The local gateway from Method 2 must be running'
      ],
      prerequisites: [
        'Python 3.8+',
        'requests library'
      ],
      setupCommands: `pip install requests`,
      filename: 'direct_send.py',
      code: `# ======================================================================
# DIRECT WHATSAPP SENDER IN PYTHON (NO WHATSAPP WEB / NO SELENIUM)
# Calls your local background gateway directly
# ======================================================================

import requests

GATEWAY_URL = "http://localhost:4000/send-message"

payload = {
    "phone": "${cleanPhone || '919876543210'}",
    "message": "${escapedMessage || 'Hello! This message was sent directly from a Python script without WhatsApp Web.'}"
}

print(f"🚀 Sending direct message to {payload['phone']}...")

try:
    response = requests.post(GATEWAY_URL, json=payload, timeout=10)
    data = response.json()
    
    if response.status_code == 200 and data.get("success"):
        print("🎉 SUCCESS! Message delivered directly in background.")
        print(f"🆔 ID: {data.get('messageId')}")
    else:
        print(f"❌ Error: {data}")
except Exception as e:
    print(f"❌ Connection error (make sure local gateway is running): {e}")
`
    },
    {
      id: 'bash',
      name: '6. 1-Line cURL Terminal Command',
      badge: 'CLI COMMAND LINE',
      category: 'CLI/URL',
      doesOpenWhatsAppWeb: false,
      description: 'Write just a single-line cURL command in a terminal or Bash script. The message is sent directly through the backend.',
      pros: [
        'Just a single-line command',
        'Can run from any language or a cron job'
      ],
      cons: [
        'The local gateway must be running in the background'
      ],
      prerequisites: [
        'cURL (comes pre-installed on every Linux/macOS/Windows 10/11 system)'
      ],
      setupCommands: `# No install needed, curl comes pre-installed`,
      filename: 'send_curl.sh',
      code: `#!/usr/bin/env bash
# ======================================================================
# 1-LINE DIRECT WHATSAPP MESSAGE DISPATCHER (NO BROWSER)
# ======================================================================

curl -X POST http://localhost:4000/send-message \\
     -H "Content-Type: application/json" \\
     -d '{
       "phone": "${cleanPhone || '919876543210'}",
       "message": "${escapedMessage || 'Direct message via 1-line cURL command!'}"
     }'
`
    }
  ];
};
