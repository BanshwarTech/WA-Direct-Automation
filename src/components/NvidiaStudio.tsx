import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, Send, Check, Copy, AlertCircle, Cpu, RefreshCw, MessageSquareQuote, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  onUseGeneratedMessage: (msg: string) => void;
  onSelectNvidiaScript: () => void;
}

export const NvidiaStudio: React.FC<Props> = ({ onUseGeneratedMessage, onSelectNvidiaScript }) => {
  const [model, setModel] = useState('meta/llama-3.3-70b-instruct');
  const [promptTopic, setPromptTopic] = useState('payment_reminder');
  const [customPrompt, setCustomPrompt] = useState('');
  const [language, setLanguage] = useState<'Hinglish' | 'Hindi' | 'English'>('Hinglish');
  const [tone, setTone] = useState('Polite & Professional');
  const [recipientName, setRecipientName] = useState('Rahul');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [serverStatus, setServerStatus] = useState<{ configured: boolean } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-Reply simulator states
  const [simCustomerMsg, setSimCustomerMsg] = useState('Bhaiya order confirm hua ya nahi? Tracking number kya hai?');
  const [simAiReply, setSimAiReply] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetch('/api/nvidia/status')
      .then((res) => res.json())
      .then((data) => setServerStatus(data))
      .catch(() => setServerStatus({ configured: false }));
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage('');

    let intent = '';
    if (promptTopic === 'payment_reminder') {
      intent = `Kindly remind ${recipientName} regarding pending invoice payment in a polite and courteous manner with UPI payment option.`;
    } else if (promptTopic === 'festive_offer') {
      intent = `Special 30% discount announcement for Diwali/Festival sale with limited-time promo code 'SAVE30' for ${recipientName}.`;
    } else if (promptTopic === 'order_dispatch') {
      intent = `Order has been packed and dispatched with tracking link. Express gratitude for purchasing.`;
    } else if (promptTopic === 'meeting_invite') {
      intent = `Schedule a quick 15-minute sync/demo call with Google Meet link.`;
    } else {
      intent = customPrompt || 'Write an engaging WhatsApp message';
    }

    try {
      const response = await fetch('/api/nvidia/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          recipientName,
          context: customPrompt,
          language,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isMissingKey) {
          setErrorMessage(
            'NVIDIA_API_KEY पर्यावरण (Environment) में सेट नहीं है। नीचे दिए गए डेमो रिस्पॉन्स को देखें या .env में NVIDIA_API_KEY="nvapi-..." जोड़ें।'
          );
          // High-quality simulated fallback
          setGeneratedOutput(getFallbackMessage(promptTopic, recipientName, language));
        } else {
          setErrorMessage(data.error || 'NVIDIA API कॉल में त्रुटि हुई');
        }
      } else {
        setGeneratedOutput(data.generatedMessage || '');
      }
    } catch (err: any) {
      setErrorMessage('सर्वर से संपर्क नहीं हो सका। डेमो आउटपुट लोड किया गया।');
      setGeneratedOutput(getFallbackMessage(promptTopic, recipientName, language));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSimulateReply = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/nvidia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: simCustomerMsg,
          systemPrompt:
            'You are an intelligent WhatsApp AI bot for an online store. Keep your reply friendly, brief, helpful and well formatted with emojis and bold text.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setSimAiReply(data.reply);
      } else {
        setSimAiReply(
          `Namaste! Aapka order successfully pack ho gaya hai aur kal dispatch hoga. Tracking link aapko SMS aur WhatsApp par mil jayegi! 📦✨ Agar koi aur sawal ho to batayein!`
        );
      }
    } catch {
      setSimAiReply(
        `Namaste! Aapka order successfully pack ho gaya hai aur kal dispatch hoga. Tracking link aapko SMS aur WhatsApp par mil jayegi! 📦✨ Agar koi aur sawal ho to batayein!`
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const getFallbackMessage = (topic: string, name: string, lang: string) => {
    if (topic === 'payment_reminder') {
      return `Namaste *${name}* ji! 🙏\n\nUmeed hai aap kushal mangal honge. Yeh ek gentle reminder hai aapke pending invoice ke baare mein.\n\nKripya suvidhanusar payment complete karein. Agar koi query ho to humein yahan reply karein.\n\nDhanyawad! ✨`;
    }
    if (topic === 'festive_offer') {
      return `🎉 *Special Festive Offer for ${name}!* 🎁\n\nSirf agle 48 ghanto ke liye, payein *Flat 30% OFF* hamare sabhi services par!\n\nCoupon code: *FESTIVE30*\nAbhi book karein: https://example.com/offer\n\nOffer limited seats ke liye hai! 🚀`;
    }
    return `Hello *${name}*! 👋\n\nAapka order confirmed ho chuka hai aur courier partner ko hand over kar diya gaya hai. 🚚\n\nTrack karein: https://track.example.com\nThank you for trusting us! ✨`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-900 p-6 md:p-8 backdrop-blur shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-650 to-green-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <Cpu className="h-6 w-6 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">NVIDIA NIM AI Integration Hub</h3>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                NVIDIA Build / NIM
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Llama 3.3 70B &amp; Nemotron AI मॉडल से WhatsApp मैसेज बनाएं और 24/7 ऑटो-रिप्लाई बॉट चलाएं
            </p>
          </div>
        </div>

        <button
          onClick={onSelectNvidiaScript}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition"
        >
          <Bot className="h-4 w-4" />
          View Full AI Bot Script (Baileys + NVIDIA) <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* API Key Status Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-950/70 p-3.5 border border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              serverStatus?.configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-300">
            {serverStatus?.configured ? (
              <span className="text-emerald-400 font-semibold">
                ✓ NVIDIA_API_KEY Server Environment में सक्रिय है (Live NIM Inference Active)
              </span>
            ) : (
              <span>
                NVIDIA API Key: <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded">.env</code> में <code className="text-emerald-400">NVIDIA_API_KEY="nvapi-..."</code> सेट करें। (फ्री की <a href="https://build.nvidia.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-medium">build.nvidia.com</a> से मिलती है)
              </span>
            )}
          </span>
        </div>
        <span className="text-[11px] text-slate-400">OpenAI-Compatible Endpoint</span>
      </div>

      {/* Main Grid: Generator + Simulator */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: AI Message Generator */}
        <div className="space-y-4 lg:col-span-7 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              1. AI WhatsApp Message Composer (NVIDIA NIM)
            </span>
            <span className="text-[11px] text-slate-400">Model: {model.split('/')[1]}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                NVIDIA NIM Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="meta/llama-3.3-70b-instruct">Meta Llama 3.3 70B (Recommended)</option>
                <option value="nvidia/llama-3.1-nemotron-70b-instruct">NVIDIA Nemotron 70B</option>
                <option value="deepseek-ai/deepseek-r1">DeepSeek R1 (Reasoning)</option>
                <option value="mistralai/mixtral-8x22b-instruct">Mixtral 8x22B Instruct</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Rahul, Priya"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Purpose / Scenario</label>
              <select
                value={promptTopic}
                onChange={(e) => setPromptTopic(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="payment_reminder">Payment Reminder</option>
                <option value="festive_offer">Festive / Sales Offer</option>
                <option value="order_dispatch">Order Dispatched</option>
                <option value="meeting_invite">Meeting / Demo Call</option>
                <option value="custom">Custom Requirement...</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Hinglish">Hinglish (Natural)</option>
                <option value="Hindi">Pure Hindi (हिंदी)</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Polite & Professional">Polite &amp; Professional</option>
                <option value="Excited & Urgent">Excited &amp; Urgent</option>
                <option value="Friendly & Casual">Friendly &amp; Casual</option>
              </select>
            </div>
          </div>

          {promptTopic === 'custom' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Custom Context</label>
              <textarea
                rows={2}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe what you want to send..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:from-emerald-400 hover:to-green-400 disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-500/20"
          >
            {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? 'Generating with NVIDIA AI...' : 'Generate WhatsApp Message with NVIDIA AI'}
          </button>

          {errorMessage && (
            <div className="rounded-lg bg-amber-950/40 p-2.5 text-xs text-amber-300 border border-amber-500/30 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Generated Result Box */}
          {generatedOutput && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400">Generated WhatsApp Message:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => onUseGeneratedMessage(generatedOutput)}
                    className="rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-emerald-500"
                  >
                    Use in Direct Sender ↑
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-[#0b141a] p-3.5 border border-slate-800 text-xs text-white whitespace-pre-wrap font-sans leading-relaxed">
                {generatedOutput}
              </div>
            </div>
          )}
        </div>

        {/* Right: 24/7 AI WhatsApp Auto-Reply Simulator */}
        <div className="space-y-4 lg:col-span-5 rounded-xl border border-slate-800 bg-slate-950/60 p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-emerald-400" />
                2. Live WhatsApp Auto-Reply Simulator
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Interactive Test
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              टेस्ट करें कि जब कोई ग्राहक आपको WhatsApp पर मैसेज भेजेगा, तो NVIDIA AI कैसे बिना आपके टाइप किए जवाब देगा:
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Customer Message (इनकमिंग मैसेज)
              </label>
              <textarea
                rows={2}
                value={simCustomerMsg}
                onChange={(e) => setSimCustomerMsg(e.target.value)}
                placeholder="Type customer question..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSimulateReply}
              disabled={isSimulating}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 border border-slate-700 disabled:opacity-50"
            >
              {isSimulating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5 text-emerald-400" />}
              {isSimulating ? 'NVIDIA AI Thinking...' : 'Test NVIDIA AI Auto-Reply'}
            </button>

            {/* Chat Simulation View */}
            <div className="rounded-xl bg-[#0b141a] p-3 border border-slate-850 space-y-2.5 min-h-[140px] flex flex-col justify-end">
              {/* Customer Bubble */}
              <div className="max-w-[85%] self-start rounded-2xl rounded-tl-xs bg-[#202c33] px-3 py-2 text-xs text-white shadow">
                <span className="text-[10px] text-slate-400 block mb-0.5">Customer:</span>
                {simCustomerMsg}
              </div>

              {/* Bot Reply Bubble */}
              {simAiReply && (
                <div className="max-w-[85%] self-end rounded-2xl rounded-tr-xs bg-[#005c4b] px-3 py-2 text-xs text-white shadow">
                  <span className="text-[10px] text-emerald-200/80 block mb-0.5">NVIDIA AI Bot (Auto-Reply):</span>
                  {simAiReply}
                  <span className="text-[9px] text-emerald-200/60 block text-right mt-1">✓✓ Just now</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>⚡ 24/7 ऑटोमेशन बिना किसी Meta API के</span>
            <span className="text-emerald-400 font-medium">Headless Socket Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};
