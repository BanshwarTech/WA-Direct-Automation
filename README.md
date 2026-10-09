# 🚀 WA Direct Automation + NVIDIA NIM AI Suite
### Send WhatsApp Messages & 24/7 AI Auto-Replies Without Meta Account, Paid Platforms, or Browser Windows

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Node: >=18](https://img.shields.io/badge/Node-%3E%3D18.0.0-blue.svg)](https://nodejs.org)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA-NIM%20AI-76B900.svg)](https://build.nvidia.com)
[![Protocol: Baileys](https://img.shields.io/badge/Protocol-Baileys%20Multi--Device-25D366.svg)](https://github.com/WhiskeySockets/Baileys)

---

## 📖 परिचय (Overview)

**WA Direct Automation** एक संपूर्ण ओपन-सोर्स WhatsApp ऑटोमेशन टूलकिट और स्क्रिप्ट हब है। यह आपको **बिना Meta Developer Account**, बिना Facebook Business Manager, बिना क्रेडिट कार्ड और **बिना Google Chrome / WhatsApp Web का पेज खोले** सीधे बैकग्राउंड में WhatsApp मैसेज भेजने और **NVIDIA NIM AI (Llama 3.3 70B & Nemotron)** से 24/7 स्मार्ट ऑटो-रिप्लाई करने की सुविधा देता है।

---

## ✨ मुख्य विशेषताएं (Key Features)

- 🚫 **Zero Meta Cloud API**: किसी Facebook App ID, बिजनेस वेरिफिकेशन या प्रति-मैसेज शुल्क की आवश्यकता नहीं।
- 🚫 **No WhatsApp Web Browser UI**: स्क्रीन पर Google Chrome या web.whatsapp.com कभी नहीं खुलता (100% Headless Socket Protocol)।
- 🧠 **NVIDIA NIM AI 24/7 Auto-Reply**: जब भी कोई ग्राहक WhatsApp पर सवाल पूछेगा, NVIDIA का **Llama 3.3 70B** या **Nemotron 70B** मॉडल अपने आप 1 सेकंड में सटीक उत्तर भेज देगा।
- ⚡ **Local Private REST API**: अपने कंप्यूटर पर सिर्फ 1-लाइन की `curl` कमांड से किसी भी समय मैसेज भेजें।
- 📱 **Android Direct ADB**: कंप्यूटर से जुड़े असली Android फोन के ऑफिशियल WhatsApp ऐप से सीधा डिस्पैच।
- 📊 **Interactive Web Studio**: बल्क मैसेज कतार, लाइव मैसेज जनरेटर और टेम्पलेट वेरियबल्स (`{name}`) के साथ आधुनिक React 19 डैशबोर्ड।
- 🛡️ **Anti-Ban Protection**: नंबर को सुरक्षित रखने के लिए बिल्ट-इन रैंडम डिले और वार्म-अप रणनीतियां।

---

## 🖥️ Local Machine Setup Guide (स्थानीय कंप्यूटर पर सेटअप करने का पूरा तरीका)

अपने Windows, macOS, या Linux कंप्यूटर पर इस प्रोजेक्ट को शुरू करने के लिए नीचे दिए गए स्टेप्स का पालन करें:

### आवश्यकताएं (Prerequisites):
- **Node.js**: v18.0.0 या उससे नया ([nodejs.org](https://nodejs.org) से डाउनलोड करें)
- **Git**: ([git-scm.com](https://git-scm.com))
- आपका सामान्य **Android या iPhone** जिसमें सामान्य WhatsApp चालू हो

---

### स्टेप 1: रिपॉजिटरी को क्लोन करें (Clone Repository)
टर्मिनल (Terminal या PowerShell) खोलें और निम्नलिखित कमांड चलाएं:
```bash
git clone https://github.com/BanshwarTech/WA-Direct-Automation.git
cd WA-Direct-Automation
```

---

### स्टेप 2: डिपेंडेंसीज इंस्टॉल करें (Install Dependencies)
```bash
npm install
```

---

### स्टेप 3: पर्यावरण फ़ाइल सेट करें (Environment Configuration)
प्रोजेक्ट रूट में `.env` फ़ाइल बनाएं:
```bash
cp .env.example .env
```
अब `.env` फ़ाइल खोलें और अपनी NVIDIA API Key डालें:
```env
# NVIDIA NIM AI Key (https://build.nvidia.com से फ्री में प्राप्त करें)
NVIDIA_API_KEY="nvapi-YOUR_NVIDIA_KEY_HERE"

# App Port (Default: 3000)
PORT=3000
```
> 💡 **फ्री NVIDIA API Key कैसे लें:**
> 1. [https://build.nvidia.com](https://build.nvidia.com) पर जाएं और फ्री अकाउंट बनाएं।
> 2. `meta/llama-3.3-70b-instruct` मॉडल पेज पर जाएं और **Get API Key** पर क्लिक करें।
> 3. आपको 1000 फ्री API क्रेडिट्स तुरंत मिल जाते हैं!

---

### स्टेप 4: वेब डैशबोर्ड चलाएं (Start Web UI & Studio)
```bash
npm run dev
```
अब अपने ब्राउज़र में खोलें: **[http://localhost:3000](http://localhost:3000)**

यहाँ आपको मिलेगा:
- **Live Direct Dispatcher**: किसी भी नंबर पर बिना सेव किए तुरंत मैसेज भेजें।
- **Bulk Queue Sender**: CSV या लिस्ट डालकर एक साथ कई लोगों को पर्सनलाइज्ड मैसेज भेजें।
- **NVIDIA AI Studio**: AI से तुरंत किसी भी उद्देश्य (Payment Reminder, Sales Offer) के लिए मैसेज लिखवाएं।
- **Script Generator**: सभी स्क्रिप्ट्स को लाइव कस्टमाइज़ और डाउनलोड करें।

---

## 🤖 24/7 AI WhatsApp Auto-Reply Bot कैसे चलाएं

अगर आप चाहते हैं कि आपका कंप्यूटर दिन-रात चालू रहे और आपके WhatsApp पर आने वाले हर ग्राहक के सवाल का जवाब **NVIDIA Llama 3.3 70B AI** खुद देता रहे:

```bash
# 1. आवश्यक पैकेज इंस्टॉल करें
npm install @whiskeysockets/baileys qrcode-terminal pino dotenv

# 2. बोट को स्टार्ट करें
node whatsapp_nvidia_ai_bot.js
```

### पहली बार QR कोड कैसे लिंक करें:
1. टर्मिनल में एक QR कोड दिखाई देगा।
2. अपने फोन में WhatsApp खोलें:
   - **Android**: ऊपरी दाएं कोने में 3 डॉट्स > **Linked Devices** > **Link a Device**
   - **iPhone**: **Settings** > **Linked Devices** > **Link a Device**
3. टर्मिनल वाले QR कोड को स्कैन करें।
4. **बस!** लॉगिन क्रेडेंशियल्स `./nvidia_bot_session` फोल्डर में सेव हो जाते हैं। इसके बाद आपको दोबारा कभी QR स्कैन नहीं करना पड़ेगा!
5. अब कोई भी आपके WhatsApp पर मैसेज करेगा, तो NVIDIA AI तुरंत उत्तर दे देगा।

---

## 📡 Private Local REST API Server कैसे चलाएं

अगर आप अपनी वेबसाइट, Python स्क्रिप्ट, PHP बैकएंड या किसी सॉफ्टवेयर से सीधे WhatsApp मैसेज भेजना चाहते हैं:

### 1. लोकल सर्वर स्टार्ट करें:
```bash
node whatsapp_local_api_server.js
```
यह आपके कंप्यूटर पर `http://localhost:4000` पर एक प्राइवेट API सर्वर चालू कर देगा।

### 2. 1-लाइन cURL से मैसेज भेजें:
```bash
curl -X POST http://localhost:4000/send-message \
     -H "Content-Type: application/json" \
     -d '{
       "phone": "919876543210",
       "message": "Namaste! Yeh message local API gateway se aaya hai."
     }'
```

### 3. Python से कॉल करें:
```python
import requests

response = requests.post("http://localhost:4000/send-message", json={
    "phone": "919876543210",
    "message": "Order confirmed! Thank you."
})
print(response.json())
```

---

## 📱 Android Phone Direct Hardware (ADB) तरीका

अगर आप कंप्यूटर पर Node.js भी नहीं चलाना चाहते और अपने फोन के असली WhatsApp ऐप से ही ऑटोमेशन कराना चाहते हैं:
1. फोन में **Developer Options > USB Debugging** ऑन करें।
2. फोन को USB केबल या Wi-Fi से PC से जोड़ें।
3. स्क्रिप्ट चलाएं:
```bash
bash send_via_android_adb.sh
```
यह आपके फोन के असली WhatsApp ऐप को खुद स्क्रीन पर मैसेज टाइप और सेंड करवा देगा!

---

## ☁️ 24/7 Background Deployment (PM2 के साथ)

अगर आप अपने लैपटॉप या Linux VPS पर इस बोट को बैकग्राउंड में हमेशा चालू रखना चाहते हैं ताकि टर्मिनल बंद करने पर भी बोट बंद न हो:

```bash
# PM2 प्रोसेस मैनेजर इंस्टॉल करें
npm install -g pm2

# NVIDIA AI Bot को बैकग्राउंड में स्टार्ट करें
pm2 start whatsapp_nvidia_ai_bot.js --name "wa-nvidia-bot"

# ऑटो-रीस्टार्ट सक्षम करें (सिस्टम रीबूट होने पर भी खुद चलेगा)
pm2 startup
pm2 save

# लॉग्स देखने के लिए
pm2 logs wa-nvidia-bot
```

---

## 🛡️ Anti-Ban Safety Rules (नंबर बैन से बचने की सावधानियां)

Meta API के बिना ऑटोमेशन करते समय हमेशा इन 5 नियमों का पालन करें:
1. **रैंडम डिले (Random Delay)**: हर मैसेज के बीच 3 से 8 सेकंड का गैप रखें। कभी भी 1 ही सेकंड में 50 मैसेज न भेजें।
2. **वार्म-अप (Warm-Up)**: नए नंबर पर पहले दिन 10-20 मैसेज, दूसरे दिन 30-40 मैसेज भेजें।
3. **पर्सनलाइजेशन (Personalization)**: हूबहू एक जैसा टेक्स्ट सैकड़ों लोगों को भेजने के बजाय `{name}` जैसे वैरिएबल्स का इस्तेमाल करें।
4. **ऑप्ट-इन संपर्क (Opt-in Contacts)**: उन लोगों को मैसेज भेजें जिन्होंने आपका नंबर सेव कर रखा हो या पहले आपसे चैट की हो।
5. **स्पैम से बचें**: अनचाहे अजनबियों को कोल्ड मैसेज न भेजें जो आपकी चैट को 'Report & Block' कर सकें।

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

## ❓ Frequently Asked Questions (सामान्य सवाल)

**Q: क्या QR कोड स्कैन करने के बाद फोन का इंटरनेट ऑन रहना ज़रूरी है?**  
A: नहीं! WhatsApp के Multi-Device आर्किटेक्चर के कारण एक बार लिंक हो जाने के बाद आपका फोन स्विच ऑफ होने पर भी बैकएंड स्क्रिप्ट 14 दिनों तक सीधे WhatsApp सर्वर से काम करती रहती है।

**Q: क्या इसमें कोई इमेज या PDF भेजी जा सकती है?**  
A: बिल्कुल! Baileys में `sock.sendMessage(jid, { image: { url: ... }, caption: "..." })` या document/pdf भेजने की पूरी सुविधा है।

**Q: अगर सेशन लॉगआउट हो जाए तो क्या करें?**  
A: बस `./nvidia_bot_session` फोल्डर को डिलीट करें और दोबारा `node whatsapp_nvidia_ai_bot.js` चलाकर एक बार नया QR कोड स्कैन कर लें।

---

## 📄 License

MIT License. Free for personal, commercial, and educational use.
Developed with ❤️ by [BanshwarTech](https://github.com/BanshwarTech).
