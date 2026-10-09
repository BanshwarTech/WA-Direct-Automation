import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { VerdictBanner } from './components/VerdictBanner';
import { NoWebExplanation } from './components/NoWebExplanation';
import { NvidiaStudio } from './components/NvidiaStudio';
import { DirectSender } from './components/DirectSender';
import { ScriptGenerator } from './components/ScriptGenerator';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { AntiBanTips } from './components/AntiBanTips';
import { getScripts } from './data/scriptsData';
import { ScriptLanguage } from './types';
import { HelpCircle, ChevronDown, Check, Sparkles, Bot, Cpu } from 'lucide-react';

export default function App() {
  const [phone, setPhone] = useState('9876543210');
  const [message, setMessage] = useState(
    'Namaste! Yeh message NVIDIA NIM AI + Baileys ke through bina kisi Meta account ke direct background me send hua hai. 🚀'
  );
  const [selectedScriptId, setSelectedScriptId] = useState<ScriptLanguage>('nvidia-bot');

  // Compute updated scripts whenever phone or message changes
  const scripts = useMemo(() => {
    return getScripts(phone, message);
  }, [phone, message]);

  const handleSelectMethodFromVerdict = (methodId: string) => {
    setSelectedScriptId(methodId as ScriptLanguage);
    const element = document.getElementById('scripts-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUseGeneratedMessage = (msg: string) => {
    setMessage(msg);
    const element = document.getElementById('dispatcher');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectNvidiaScript = () => {
    setSelectedScriptId('nvidia-bot');
    const element = document.getElementById('scripts-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'NVIDIA NIM API को WhatsApp बॉट के साथ कैसे इंटीग्रेट किया गया है?',
      a: 'NVIDIA (build.nvidia.com) अपनी Llama 3.3 70B, Nemotron 70B और DeepSeek R1 मॉडल्स के लिए OpenAI-कम्पैटिबल API प्रदान करता है। हमारी स्क्रिप्ट (whatsapp_nvidia_ai_bot.js) Baileys सॉकेट के ज़रिए ग्राहक के इनकमिंग WhatsApp मैसेज को सीधे NVIDIA NIM सर्वर पर भेजती है, AI उत्तर तैयार करवाती है और 1 सेकंड के अंदर WhatsApp पर ऑटोमैटिक रिप्लाई कर देती है। इसके लिए किसी Meta Business Account की ज़रूरत नहीं है।'
    },
    {
      q: 'NVIDIA API Key कहाँ से और कैसे मिलेगी?',
      a: 'NVIDIA की आधिकारिक वेबसाइट https://build.nvidia.com पर जाएं और अपना फ्री एकाउंट बनाएं। आपको 1000 फ्री API क्रेडिट्स मिलते हैं। वहाँ से अपनी API Key (nvapi-...) कॉपी करके अपने प्रोजेक्ट के .env फ़ाइल में NVIDIA_API_KEY="nvapi-..." के रूप में सेट करें।'
    },
    {
      q: 'क्या Baileys या Local API चलाने पर स्क्रीन पर WhatsApp Web या Chrome खुलेगा?',
      a: 'नहीं! बिल्कुल नहीं। Baileys एक हेडलेस (Headless) सॉकेट लाइब्रेरी है। यह स्क्रीन पर कोई भी ब्राउज़र, क्रोम विंडो या WhatsApp Web का पेज लोड नहीं करता। यह चुपचाप बैकग्राउंड में सिर्फ 0.5 सेकंड में नेटवर्क पैकेट्स भेज देता है।'
    },
    {
      q: 'अगर मुझे किसी टर्मिनल या बैकएंड से 1-लाइन में मैसेज भेजना हो तो क्या करूँ?',
      a: 'विधि #2 (Local Private REST Gateway) सबसे बेस्ट है। अपने सिस्टम पर whatsapp_local_api_server.js चला दें। इसके बाद आप किसी भी टर्मिनल, Python, PHP या curl से `curl -X POST http://localhost:4000/send-message -d \'{"phone":"91...", "message":"..."}\'` चलाकर बैकग्राउंड में बिना कुछ खोले मैसेज भेज सकते हैं।'
    },
    {
      q: 'क्या Android Phone से सीधे (बिना WhatsApp Web के) सेंड कर सकते हैं?',
      a: 'हाँ! विधि #3 (Android ADB) आपके असली मोबाइल फोन के ऑफिशियल WhatsApp ऐप को USB या Wi-Fi के माध्यम से निर्देश देती है और फोन खुद बैकग्राउंड में मैसेज सेंड कर देता है।'
    },
    {
      q: 'क्या इसके लिए किसी Meta Business Account, Credit Card या Facebook App की ज़रूरत है?',
      a: 'नहीं, बिल्कुल नहीं! Meta Cloud API सिर्फ बड़ी कंपनियों के लिए होती है जिसमें पैसे और अप्रूवल लगते हैं। हमारी स्क्रिप्ट्स बिना किसी Meta अकाउंट के सीधे काम करती हैं।'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Step 1: Direct Verdict Answer (Yes or No) */}
        <section id="verdict">
          <VerdictBanner onSelectMethod={handleSelectMethodFromVerdict} />
        </section>

        {/* Step 2: Clear Explanation: Why WhatsApp Web won't open */}
        <section id="no-web-explanation">
          <NoWebExplanation onSelectMethod={handleSelectMethodFromVerdict} />
        </section>

        {/* Step 3: NVIDIA NIM AI Integration Studio */}
        <section id="nvidia-studio">
          <NvidiaStudio
            onUseGeneratedMessage={handleUseGeneratedMessage}
            onSelectNvidiaScript={handleSelectNvidiaScript}
          />
        </section>

        {/* Step 4: Script Generator with dynamic phone & message */}
        <section id="scripts-section">
          <ScriptGenerator
            scripts={scripts}
            selectedScriptId={selectedScriptId}
            setSelectedScriptId={setSelectedScriptId}
          />
        </section>

        {/* Step 5: Live Direct Dispatcher */}
        <section id="dispatcher">
          <DirectSender
            phone={phone}
            setPhone={setPhone}
            message={message}
            setMessage={setMessage}
          />
        </section>

        {/* Step 6: Method Comparison Matrix */}
        <section id="comparison">
          <ComparisonMatrix />
        </section>

        {/* Step 7: Anti-Ban Protection Tips */}
        <section id="antiban">
          <AntiBanTips />
        </section>

        {/* Step 8: Common Questions (FAQs) */}
        <section id="faq" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur shadow-xl space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <HelpCircle className="h-4 w-4" />
            </span>
            <h3 className="text-xl font-bold text-white">Frequently Asked Questions (अक्सर पूछे जाने वाले सवाल)</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold text-white hover:text-emerald-400"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform text-slate-400 ${
                      openFaq === i ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-900/30">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>WhatsApp Direct Automation + NVIDIA NIM AI Suite — Free &amp; Open Source</span>
          <span className="text-slate-400">Powered by Baileys Socket &amp; NVIDIA Llama 3.3 70B • Zero Meta API</span>
        </div>
      </footer>
    </div>
  );
}
