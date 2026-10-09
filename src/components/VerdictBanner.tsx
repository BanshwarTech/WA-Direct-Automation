import React from 'react';
import { CheckCircle2, ShieldCheck, Zap, ArrowRight, EyeOff, Server, Smartphone } from 'lucide-react';

interface Props {
  onSelectMethod: (methodId: string) => void;
}

export const VerdictBanner: React.FC<Props> = ({ onSelectMethod }) => {
  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-emerald-900/10 to-slate-900 p-6 md:p-8 shadow-xl backdrop-blur-sm">
      {/* Top Yes Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 font-black text-2xl animate-pulse">
            YES!
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> 100% Possible (हाँ, बिल्कुल संभव है)
              </span>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300 border border-amber-500/20">
                Zero Meta Account
              </span>
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                <EyeOff className="h-3 w-3" /> No WhatsApp Web Screen
              </span>
            </div>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white md:text-3xl">
              बिना WhatsApp Web और बिना Meta Account के डायरेक्ट सेंड संभव है!
            </h2>
          </div>
        </div>
      </div>

      {/* Explanation in clear Hinglish & English */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Method 1 */}
        <div className="group relative rounded-xl border border-slate-800 bg-slate-900/80 p-5 transition-all hover:border-emerald-500/50 hover:bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold">
              1
            </span>
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Pure Headless (0% Browser)
            </span>
          </div>
          <h3 className="font-semibold text-white text-base">Node.js Baileys Socket</h3>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            WhatsApp Web का कोई पेज स्क्रीन पर नहीं खुलता! यह बैकएंड में सीधा कच्चा बाइनरी सॉकेट पैकेट भेजता है। पर्दे के पीछे 0.5 सेकंड में डायरेक्ट डिलीवरी।
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>✨ Zero Browser UI</span>
            <button
              onClick={() => onSelectMethod('baileys')}
              className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              स्क्रिप्ट देखें <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Method 2 */}
        <div className="group relative rounded-xl border border-slate-800 bg-slate-900/80 p-5 transition-all hover:border-emerald-500/50 hover:bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 font-bold">
              2
            </span>
            <span className="text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
              Self-Hosted REST API
            </span>
          </div>
          <h3 className="font-semibold text-white text-base">Local Private REST Gateway</h3>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            आपके अपने कंप्यूटर पर 1 बार बैकग्राउंड API सर्वर रन होता है। इसके बाद आप किसी भी टर्मिनल से सिर्फ 1-लाइन <code className="text-amber-300 text-xs bg-slate-800 px-1 py-0.5 rounded">curl</code> चलाकर सीधा मैसेज भेज सकते हैं।
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>📡 1-Line cURL Trigger</span>
            <button
              onClick={() => onSelectMethod('local-api')}
              className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              स्क्रिप्ट देखें <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Method 3 */}
        <div className="group relative rounded-xl border border-slate-800 bg-slate-900/80 p-5 transition-all hover:border-emerald-500/50 hover:bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 font-bold">
              3
            </span>
            <span className="text-[11px] font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
              Phone Native (ADB / Termux)
            </span>
          </div>
          <h3 className="font-semibold text-white text-base">Android Phone Direct Hardware</h3>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            अपने Android फोन को USB/WiFi से जोड़ें और ADB कमांड चलाएं। आपके फोन का असली WhatsApp ऐप खुद मैसेज टाइप करके सेंड कर देगा! वेब का 0% इस्तेमाल।
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>📱 100% Phone Hardware</span>
            <button
              onClick={() => onSelectMethod('android-adb')}
              className="text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              स्क्रिप्ट देखें <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Clear Note */}
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-slate-950/60 p-4 border border-slate-800 text-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-slate-300 text-xs md:text-sm">
            <strong className="text-white">ज़रूरी स्पष्टीकरण:</strong> इन तीनों तरीकों में से किसी में भी <strong>ना Chrome खुलेगा, ना WhatsApp Web का पेज स्क्रीन पर आएगा, ना Meta का एकाउंट लगेगा</strong>। सब कुछ शुद्ध बैकग्राउंड या आपके अपने फोन से सीधे होगा।
          </p>
        </div>
        <span className="shrink-0 text-xs text-emerald-400 bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-500/30">
          100% Background Execution
        </span>
      </div>
    </div>
  );
};
