import React from 'react';
import { ShieldCheck, XCircle, CheckCircle2, Cpu, Smartphone, Server, Zap, ArrowRight } from 'lucide-react';

interface Props {
  onSelectMethod: (methodId: string) => void;
}

export const NoWebExplanation: React.FC<Props> = ({ onSelectMethod }) => {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 p-6 md:p-8 shadow-2xl backdrop-blur">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <Zap className="h-3.5 w-3.5" />
            आपकी समस्या का सीधा समाधान (Direct Background Send)
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">
            "WhatsApp Web नहीं खोलना, सीधा डायरेक्ट सेंड हो जाए" — यहाँ समझें कैसे!
          </h2>
          <p className="text-sm text-slate-300">
            बहुत से लोग सोचते हैं कि ऑटोमेशन में Chrome ब्राउज़र और WhatsApp Web का पेज खुलेगा। <strong className="text-emerald-400">लेकिन ऐसा बिल्कुल नहीं है!</strong>
          </p>
        </div>
      </div>

      {/* Comparison: What you don't want vs What we are giving */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Left: What you DON'T want */}
        <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <XCircle className="h-5 w-5" />
            जो आपको नहीं चाहिए (Browser &amp; WhatsApp Web UI)
          </div>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">✗</span>
              <span>Google Chrome या ब्राउज़र विंडो स्क्रीन पर खुलना</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">✗</span>
              <span>web.whatsapp.com का धीमा लोड होना और सेंड बटन पर क्लिक करने का इंतज़ार करना</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">✗</span>
              <span>Meta Developer Account, Credit Card या Paid Twilio/Wati प्लेटफॉर्म्स</span>
            </li>
          </ul>
          <div className="rounded-lg bg-slate-950/80 p-2.5 text-[11px] text-red-300 border border-red-500/20">
            ❌ यह तरीका धीमा और असुविधाजनक होता है।
          </div>
        </div>

        {/* Right: What we are giving */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="h-5 w-5" />
            जो हम आपको दे रहे हैं (100% Direct Headless &amp; Background)
          </div>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>कोई ब्राउज़र नहीं खुलता (0% Chrome/Web UI)</strong>: कोड बैकग्राउंड में शुद्ध बाइनरी सॉकेट से सीधे WhatsApp सर्वर को मैसेज भेज देता है।</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>लोकल प्राइवेट API सर्वर</strong>: आप सिर्फ 1 लाइन की <code className="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded">curl</code> या HTTP POST रिक्वेस्ट चलाएंगे और मैसेज बैकग्राउंड में डिलीवर हो जाएगा!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Android Direct (ADB)</strong>: सीधे आपके असली फोन का ऑफिशियल ऐप मैसेज भेजता है, वेब का कोई नामोनिशान नहीं!</span>
            </li>
          </ul>
          <div className="rounded-lg bg-emerald-950/40 p-2.5 text-[11px] text-emerald-300 border border-emerald-500/30">
            ✅ 0.5 सेकंड में डायरेक्ट डिलीवरी, स्क्रीन पर कुछ नहीं खुलेगा!
          </div>
        </div>
      </div>

      {/* 3 Direct Ways Cards */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4">
          आपके लिए 3 सबसे बेहतरीन डायरेक्ट (Non-Web) तरीके:
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Card 1 */}
          <div
            onClick={() => onSelectMethod('baileys')}
            className="cursor-pointer group rounded-xl border border-slate-800 bg-slate-950 p-4 transition-all hover:border-emerald-500/50 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Cpu className="h-4 w-4" />
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Socket
              </span>
            </div>
            <div className="font-bold text-white text-sm">Baileys Headless</div>
            <p className="mt-1 text-xs text-slate-400">
              शुद्ध बैकग्राउंड प्रोसेस। कोई Chrome या ब्राउज़र नहीं खुलता। 0.5 सेकंड में डायरेक्ट सेंड।
            </p>
            <div className="mt-3 text-xs text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              स्क्रिप्ट देखें <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onSelectMethod('local-api')}
            className="cursor-pointer group rounded-xl border border-slate-800 bg-slate-950 p-4 transition-all hover:border-emerald-500/50 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <Server className="h-4 w-4" />
              </span>
              <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                Local API
              </span>
            </div>
            <div className="font-bold text-white text-sm">Local Private REST Gateway</div>
            <p className="mt-1 text-xs text-slate-400">
              अपने PC पर 1 बार API चलाएं। फिर किसी भी टर्मिनल से सिर्फ 1-लाइन cURL से चुपचाप मैसेज भेजें।
            </p>
            <div className="mt-3 text-xs text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              स्क्रिप्ट देखें <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onSelectMethod('android-adb')}
            className="cursor-pointer group rounded-xl border border-slate-800 bg-slate-950 p-4 transition-all hover:border-emerald-500/50 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                <Smartphone className="h-4 w-4" />
              </span>
              <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                Android ADB
              </span>
            </div>
            <div className="font-bold text-white text-sm">Direct Phone Hardware</div>
            <p className="mt-1 text-xs text-slate-400">
              फोन को USB/Wi-Fi से जोड़ें। असली WhatsApp मोबाइल ऐप से डायरेक्ट ऑटोमैटिक सेंड होगा।
            </p>
            <div className="mt-3 text-xs text-purple-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              स्क्रिप्ट देखें <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
