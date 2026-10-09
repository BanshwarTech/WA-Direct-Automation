import React from 'react';
import { ShieldAlert, Clock, Shuffle, UserCheck, Flame, BellOff } from 'lucide-react';

export const AntiBanTips: React.FC = () => {
  const tips = [
    {
      icon: <Clock className="h-5 w-5 text-amber-400" />,
      title: 'मैसेज के बीच 3 से 8 सेकंड का रैंडम गैप रखें',
      desc: 'अगर आप 1 ही सेकंड में 50 मैसेज भेजेंगे तो WhatsApp का स्पैम डिटेक्टर बॉट तुरंत नंबर ब्लॉक कर सकता है। हर मैसेज के बीच random sleep/delay डालें।'
    },
    {
      icon: <Shuffle className="h-5 w-5 text-emerald-400" />,
      title: 'हर मैसेज में नाम या वेरिएबल अलग रखें',
      desc: 'हूबहू एक जैसा टेक्स्ट 500 लोगों को भेजने से बचें। जैसे "नमस्ते Rahul", "नमस्ते Priya" जैसे वैरिएबल का उपयोग करें।'
    },
    {
      icon: <Flame className="h-5 w-5 text-orange-400" />,
      title: 'नए नंबर को Warm-Up करें',
      desc: 'अगर नया सिम या नंबर है तो पहले दिन 10-15 मैसेज, दूसरे दिन 25-30 मैसेज भेजें। एकदम से 1000 मैसेज भेजने से फ्लैग लग सकता है।'
    },
    {
      icon: <UserCheck className="h-5 w-5 text-blue-400" />,
      title: 'जिनके नंबर पहले से सेव हों उन्हें भेजें',
      desc: 'अगर रिसीवर ने भी आपका नंबर सेव कर रखा है या दोनों के बीच पहले चैट हुई है, तो बैन होने का रिस्क लगभग 0% हो जाता है।'
    },
    {
      icon: <BellOff className="h-5 w-5 text-purple-400" />,
      title: 'अपरिचित लोगों को अनचाहा स्पैम न भेजें',
      desc: 'अगर कई लोग आपकी चैट को "Report & Block" करते हैं, तो WhatsApp ऑटोमैटिकली अकाउंट फ्रीज कर देता है। केवल अपने क्लाइंट्स, कस्टमर्स या जानकारों को मैसेज भेजें।'
    }
  ];

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-6 md:p-8 backdrop-blur shadow-xl space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-xl font-bold text-white">
            नंबर को Ban होने से बचाने की ज़रूरी सावधानियां (Anti-Ban Rules)
          </h3>
          <p className="text-sm text-slate-400">
            चूंकि आप Meta API के बिना डायरेक्ट स्क्रिप्ट चला रहे हैं, इन 5 नियमों का पालन ज़रूर करें
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-2">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 transition-all hover:border-slate-700"
          >
            <div className="flex items-center gap-2 mb-2">
              {tip.icon}
              <h4 className="text-xs font-bold text-white leading-snug">{tip.title}</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
