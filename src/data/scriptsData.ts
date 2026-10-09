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
      description: 'NVIDIA NIM API (Llama 3.3 70B / Nemotron) को WhatsApp Baileys के साथ जोड़ता है। जब भी कोई व्यक्ति आपके WhatsApp पर मैसेज भेजेगा, NVIDIA AI उसे समझकर अपने आप हिंदी, हिंग्लिश या इंग्लिश में बुद्धिमान उत्तर (Smart Auto-Reply) दे देगा! 0% WhatsApp Web, 0% Meta Account!',
      pros: [
        'NVIDIA NIM AI (Llama 3.3 70B / DeepSeek R1 / Nemotron) पावर्ड ऑटो-रिप्लाई',
        'कोई WhatsApp Web या ब्राउज़र नहीं खुलता (100% बैकग्राउंड हेडलेस)',
        'ना Meta Developer एकाउंट, ना Twilio/Wati का मासिक शुल्क',
        'कस्टमर सपोर्ट, लीड्स और 24/7 ऑटोमेशन के लिए सबसे बेहतरीन'
      ],
      cons: [
        'NVIDIA NIM API Key चाहिए (build.nvidia.com से फ्री क्रेडिट्स मिलते हैं)'
      ],
      prerequisites: [
        'Node.js 18+ कंप्यूटर या VPS पर',
        'NVIDIA API Key (https://build.nvidia.com से फ्री प्राप्त करें)'
      ],
      setupCommands: `mkdir wa-nvidia-bot\ncd wa-nvidia-bot\nnpm init -y\nnpm install @whiskeysockets/baileys qrcode-terminal pino dotenv`,
      filename: 'whatsapp_nvidia_ai_bot.js',
      code: `// ======================================================================
// WHATSAPP DIRECT AUTOMATION + NVIDIA NIM AI BOT (NO META ACCOUNT)
// Powered by: Baileys (Headless) + NVIDIA NIM (Llama 3.3 70B / Nemotron)
// ======================================================================

require('dotenv').config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

// 🔑 आपकी NVIDIA API Key (build.nvidia.com से प्राप्त करें)
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "nvapi-YOUR_NVIDIA_API_KEY_HERE";
const NVIDIA_MODEL = "meta/llama-3.3-70b-instruct"; // या "nvidia/llama-3.1-nemotron-70b-instruct"

// 🧠 NVIDIA NIM AI API कॉल फंक्शन
async function askNvidiaAI(userQuery, senderName = "User") {
  const systemPrompt = \`आप एक अत्यंत बुद्धिमान, विनम्र और सहायक WhatsApp AI सहायक हैं।
- उत्तर संक्षेप में, स्पष्ट और प्राकृतिक रखें (WhatsApp स्टाइल)।
- यूजर जिस भाषा में पूछे (Hindi, Hinglish, English) उसी भाषा में उत्तर दें।
- जरूरी बिंदुओं को *bold* करें और इमोजी का उपयुक्त उपयोग करें।\`;

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
      return "माफ़ कीजिए, AI सेवा से संपर्क नहीं हो सका।";
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || "नमस्ते! मैं आपकी किस प्रकार सहायता कर सकता हूँ?";
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
    return "तकनीकी समस्या के कारण उत्तर नहीं मिल सका।";
  }
}

// 🚀 WhatsApp बोट शुरू करें
async function startNvidiaWhatsAppBot() {
  console.log("⚡ WhatsApp + NVIDIA AI Bot शुरू हो रहा है...");

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
      console.log('\\n📲 फोन के WhatsApp से QR कोड स्कैन करें (Settings -> Linked Devices):\\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const isLoggedOut = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;
      if (!isLoggedOut) {
        console.log('🔄 Reconnecting WhatsApp...');
        startNvidiaWhatsAppBot();
      }
    } else if (connection === 'open') {
      console.log('🤖 WhatsApp + NVIDIA AI Bot सक्रिय और तैयार है!');
      console.log('🟢 अब आने वाले हर मैसेज का उत्तर NVIDIA AI देगा!');
    }
  });

  // 📩 नए मैसेज आने पर इवेंट (Auto-Reply Handler)
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      // अगर मैसेज खुद हमारे द्वारा भेजा गया है तो छोड़ें
      if (msg.key.fromMe) continue;

      const senderJid = msg.key.remoteJid;
      // केवल प्राइवेट चैट हैंडल करें (ग्रुप चैट के लिए @g.us चेक करें)
      if (senderJid.endsWith('@g.us')) continue;

      // मैसेज का टेक्स्ट निकालें
      const incomingText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      if (!incomingText.trim()) continue;

      console.log(\`\\n📩 मैसेज मिला (\${senderJid}): "\${incomingText}"\`);
      console.log("🧠 NVIDIA NIM AI से उत्तर तैयार हो रहा है...");

      // टाइपिंग इंडिकेटर दिखाएं (Typing...)
      await sock.sendPresenceUpdate('composing', senderJid);

      // NVIDIA AI से रिप्लाई प्राप्त करें
      const aiResponse = await askNvidiaAI(incomingText, msg.pushName || "दोस्त");

      // WhatsApp पर उत्तर भेजें
      await sock.sendMessage(senderJid, { text: aiResponse });
      console.log(\`📤 उत्तर भेज दिया गया: "\${aiResponse.substring(0, 50)}..."\`);

      // टाइपिंग इंडिकेटर हटाएं
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
      description: 'इसमें WhatsApp Web या कोई भी ब्राउज़र स्क्रीन पर बिल्कुल नहीं खुलता! यह Node.js में सीधा WebSocket नेटवर्क पैकेट्स भेजता है। पर्दे के पीछे बैकग्राउंड में चलता है और सीधे WhatsApp सर्वर से बात करता है।',
      pros: [
        'WhatsApp Web या Chrome स्क्रीन पर बिल्कुल नहीं खुलता (0% Browser)',
        'ना कोई Meta/Facebook एकाउंट, ना कोई पेड API',
        'अल्ट्रा-फास्ट (मैसेज 0.5 सेकंड में डिलीवर)',
        'सिस्टम रिसोर्स बेहद कम लेता है (रैम <40MB)'
      ],
      cons: [
        'पहली बार टर्मिनल में एक बार QR कोड स्कैन करके अपना डिवाइस लिंक करना पड़ता है (इसके बाद सेशन हमेशा सेव रहता है)'
      ],
      prerequisites: [
        'Node.js 18+ आपके कंप्यूटर या VPS सर्वर पर',
        'आपका सामान्य स्मार्टफोन जिसमें WhatsApp चालू हो'
      ],
      setupCommands: `mkdir direct-whatsapp-bot\ncd direct-whatsapp-bot\nnpm init -y\nnpm install @whiskeysockets/baileys qrcode-terminal pino`,
      filename: 'direct_send_baileys.js',
      code: `// ======================================================================
// PURE HEADLESS DIRECT WHATSAPP SENDER (NO WHATSAPP WEB / NO BROWSER)
// ======================================================================
// इस स्क्रिप्ट में कोई भी ब्राउज़र या WhatsApp Web पेज नहीं खुलेगा।
// यह बैकएंड सॉकेट के ज़रिए सीधे WhatsApp सर्वर से बात करता है।

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

// जिस नंबर पर भेजना है (कंट्री कोड के साथ, बिना '+' के)
const RECIPIENT = "${cleanPhone || '919876543210'}";
const MESSAGE = "${escapedMessage || 'Namaste! Yeh message bina kisi WhatsApp Web browser ya Meta account ke direct background me send hua hai.'}";

async function runDirectHeadlessSender() {
  console.log('⚡ Starting Headless Direct Socket (No Browser UI)...');

  // 1. स्थानीय फोल्डर में लॉगिन क्रेडेंशियल्स सेव होते हैं (ताकि बार-बार लिंक न करना पड़े)
  const { state, saveCreds } = await useMultiFileAuthState('./headless_auth');

  // 2. शुद्ध हेडलेस सॉकेट कनेक्शन
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }), // कोई फालतू लॉग नहीं
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // सिर्फ पहली बार लिंक करने के लिए टर्मिनल में QR दिखेगा
    if (qr) {
      console.log('\\n======================================================');
      console.log('📲 सिर्फ पहली बार अपने फोन से लिंक करें:');
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
        
        // सीधे बैकग्राउंड में सेंड करें (कोई वेब पेज नहीं खुलता)
        const sent = await sock.sendMessage(jid, { text: MESSAGE });

        console.log('🎉 SUCCESS! Message delivered directly in background.');
        console.log('🆔 WhatsApp Message ID:', sent.key.id);

        // सेंड होने के 2 सेकंड बाद प्रोसेस बंद
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
      description: 'अपने कंप्यूटर पर एक प्राइवेट बैकग्राउंड API सर्वर चलाएं। इसके बाद आप किसी भी भाषा (Python, PHP, cURL, Bash) से केवल एक HTTP POST रिक्वेस्ट भेजेंगे और बैकग्राउंड में बिना कोई ब्राउज़र खोले मैसेज चला जाएगा!',
      pros: [
        'WhatsApp Web का कोई निशान नहीं (Zero Browser UI)',
        'सिर्फ एक cURL या POST रिक्वेस्ट से कभी भी मैसेज भेजें',
        'Meta/Twilio जैसा काम, लेकिन 100% फ्री और आपके अपने सिस्टम पर'
      ],
      cons: [
        'बैकग्राउंड में Node.js सर्वर बैकएंड चालू रहना चाहिए'
      ],
      prerequisites: [
        'Node.js 18+',
        'Express.js और Baileys'
      ],
      setupCommands: `mkdir my-whatsapp-api\ncd my-whatsapp-api\nnpm init -y\nnpm install @whiskeysockets/baileys express qrcode-terminal pino`,
      filename: 'whatsapp_local_api_server.js',
      code: `// ======================================================================
// YOUR OWN PRIVATE WHATSAPP REST API GATEWAY (100% FREE, NO META)
// ======================================================================
// इसे बैकग्राउंड में चलाएं। फिर curl http://localhost:4000/send-message से
// बिना कोई ब्राउज़र या WhatsApp Web खोले सीधे मैसेज भेजें।

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
 * 💡 इस API को कॉल करने का तरीका (किसी भी टर्मिनल से):
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
      description: 'अगर आपको कंप्यूटर या सर्वर पर भी कुछ लिंक नहीं करना और सीधे अपने Android फोन के असली WhatsApp ऐप से मैसेज भेजना है! अपने फोन को USB या Wi-Fi डिबगिंग से जोड़ें और टर्मिनल से सीधे फोन में कमांड चलाएं। 0% WhatsApp Web!',
      pros: [
        'WhatsApp Web का दूर-दूर तक कोई लेना-देना नहीं',
        'आपके असली फोन का ऑफिशियल WhatsApp ऐप ही मैसेज भेजता है',
        'कोई अकाउंट बैन होने का डर नहीं क्योंकि फोन का ओरिजिनल ऐप इस्तेमाल होता है',
        'सिर्फ एक साधारण Bash/Python स्क्रिप्ट'
      ],
      cons: [
        'Android फोन PC से कनेक्ट होना चाहिए (USB या Wi-Fi ADB द्वारा)'
      ],
      prerequisites: [
        'Android फोन में Developer Options -> USB Debugging ऑन हो',
        'कंप्यूटर पर ADB (Android Debug Bridge) टूल'
      ],
      setupCommands: `# Ubuntu/Debian: sudo apt install adb\n# macOS: brew install android-platform-tools\n# Windows: choco install adb (or download platform-tools)\nadb devices`,
      filename: 'send_via_android_adb.sh',
      code: `#!/usr/bin/env bash
# ======================================================================
# DIRECT WHATSAPP SENDER VIA ANDROID PHONE (NO WHATSAPP WEB AT ALL)
# Uses Android Debug Bridge (ADB) to trigger original WhatsApp on phone
# ======================================================================

PHONE="${cleanPhone || '919876543210'}"
MESSAGE="${escapedMessage || 'Namaste! Yeh message mere Android phone ke official app se direct bheja gaya hai.'}"

echo "📱 Checking connected Android phone..."
adb devices

# 1. Phone की स्क्रीन ऑन करें और अनलॉक करें (अगर लॉक है)
adb shell input keyevent 26
adb shell input keyevent 82

# 2. फोन के असली WhatsApp ऐप में डायरेक्ट चैट खोलें (Intent)
echo "🚀 Opening chat with +$PHONE on Android phone..."
adb shell am start -a android.intent.action.VIEW \\
    -d "https://api.whatsapp.com/send?phone=$PHONE&text=$MESSAGE" \\
    com.whatsapp

# 3. WhatsApp को लोड होने के लिए 1.5 सेकंड का इंतज़ार दें
sleep 1.5

# 4. WhatsApp के 'Send' बटन पर ऑटोमैटिक क्लिक करें (Enter keyevent)
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
      description: 'कंप्यूटर की भी ज़रूरत नहीं! अगर आप चाहते हैं कि स्क्रिप्ट आपके अपने Android फोन के अंदर ही चले और सीधे WhatsApp मैसेज भेज दे, तो Termux ऐप में यह 100% संभव है।',
      pros: [
        'किसी कंप्यूटर या सर्वर की ज़रूरत नहीं',
        'सीधे मोबाइल में बैकग्राउंड में चलता है',
        'ना WhatsApp Web, ना Meta API'
      ],
      cons: [
        'Android फोन में Termux और Termux:API ऐप इंस्टॉल करना होता है'
      ],
      prerequisites: [
        'Android फोन में F-Droid से Termux इंस्टॉल करें',
        'Termux:API ऐप'
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

# Termux Intent के ज़रिए WhatsApp को सीधे मैसेज ट्रिगर करें:
am start -a android.intent.action.VIEW \\
  -d "https://api.whatsapp.com/send?phone=\${PHONE}&text=\${MESSAGE}" \\
  com.whatsapp

sleep 1

# Send बटन ट्रिगर
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
      description: 'Python के जरिए हमारे लोकल REST गेटवे (विधि 2) को कॉल करने की स्क्रिप्ट। कोई Chrome या Selenium नहीं खुलता, 1 सेकंड में बैकएंड से कॉल हो जाती है।',
      pros: [
        'कोई ब्राउज़र नहीं खुलता (No Chrome/Edge)',
        'सिर्फ 5 लाइन का साफ Python कोड',
        'Fast and lightweight'
      ],
      cons: [
        'विधि 2 वाला लोकल गेटवे रन होना चाहिए'
      ],
      prerequisites: [
        'Python 3.8+',
        'requests लाइब्रेरी'
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
    "message": "${escapedMessage || 'Namaste! Yeh message Python script se bina WhatsApp Web ke direct bheja gaya hai.'}"
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
      description: 'टर्मिनल या बैश स्क्रिप्ट में केवल 1 लाइन की cURL कमांड लिखें। बैकएंड में सीधे मैसेज चला जाएगा।',
      pros: [
        'सिर्फ 1 लाइन की कमांड',
        'किसी भी भाषा या क्रोन जॉब (Cron Job) में चल सकती है'
      ],
      cons: [
        'लोकल गेटवे बैकग्राउंड में चलना चाहिए'
      ],
      prerequisites: [
        'cURL (हर Linux/macOS/Windows 10/11 में पहले से मौजूद होता है)'
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
