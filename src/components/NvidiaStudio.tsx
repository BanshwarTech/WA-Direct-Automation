import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { confirmDialog } from './Dialog';
import { Sparkles, Bot, Send, Check, Copy, AlertCircle, Cpu, RefreshCw, MessageSquareQuote, CheckCircle2, ArrowRight, Zap, Feather, Wallet, Gift, Truck, CalendarDays, PenLine, Languages, Briefcase, Flame, Smile, Bookmark, Plus, X, Loader2 } from 'lucide-react';
import { Select } from './Select';
import { inputCls, textareaCls, btnPrimary, btnPrimarySm, btnSecondary } from './ui';

interface Props {
  onUseGeneratedMessage: (msg: string) => void;
  /** Called for every real (non-demo) generation so it can be stored in the AI history */
  onMessageGenerated?: (msg: string) => void;
  /** Opens the bot script on the Scripts page; omitted for non-admins (the button is hidden) */
  onSelectNvidiaScript?: () => void;
}

interface Scenario {
  id: string;
  name: string;
  instructions: string;
}

// Modal for saving a reusable scenario to the user's account. Rendered into <body> through a portal because
// ancestors with backdrop-filter would otherwise trap the fixed overlay inside the card.
const AddScenarioDialog: React.FC<{ onClose: () => void; onSaved: (s: Scenario) => void }> = ({ onClose, onSaved }) => {
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, instructions }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error(data.error || 'Could not save the scenario'), { field: data.field });
      onSaved(data.scenario);
    } catch (err: any) {
      setError({ message: err.message, field: err.field });
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-scenario-title"
        onSubmit={save}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-md shadow-green-600/30">
              <Bookmark className="h-5 w-5" />
            </span>
            <div>
              <h3 id="add-scenario-title" className="text-lg font-bold text-navy-900">New scenario</h3>
              <p className="text-xs text-slate-500">Saved to your account for next time.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-navy-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error.message}
            </div>
          )}
          <label className="block">
            <span className="text-sm font-semibold text-navy-900">Scenario name</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="e.g. Appointment reminder"
              className={`mt-1.5 ${inputCls}`}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-900">What should the message say?</span>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              maxLength={600}
              placeholder="e.g. Remind the customer about their appointment tomorrow at 4 PM and ask them to reply YES to confirm."
              className={`mt-1.5 ${textareaCls}`}
            />
            <span className="mt-1 block text-right text-[11px] text-slate-400">{instructions.length}/600</span>
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className={btnPrimary}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save scenario
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

export const NvidiaStudio: React.FC<Props> = ({ onUseGeneratedMessage, onMessageGenerated, onSelectNvidiaScript }) => {
  const [model, setModel] = useState('nvidia/nemotron-3-super-120b-a12b');
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
  const [simCustomerMsg, setSimCustomerMsg] = useState('Hi, has my order been confirmed? Could you share the tracking number?');
  const [simAiReply, setSimAiReply] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // The user's own saved scenarios (stored on the server with their account)
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [showAddScenario, setShowAddScenario] = useState(false);

  useEffect(() => {
    fetch('/api/scenarios')
      .then((r) => (r.ok ? r.json() : { scenarios: [] }))
      .then((d) => setScenarios(d.scenarios ?? []))
      .catch(() => {});
  }, []);

  const selectedScenario = promptTopic.startsWith('saved:') ? scenarios.find((sc) => `saved:${sc.id}` === promptTopic) : undefined;

  const removeScenario = async (sc: Scenario) => {
    const ok = await confirmDialog({
      title: 'Delete this scenario?',
      message: <>“{sc.name}” will be removed from your Purpose list. This cannot be undone.</>,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    await fetch(`/api/scenarios/${sc.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});
    setScenarios((list) => list.filter((x) => x.id !== sc.id));
    if (promptTopic === `saved:${sc.id}`) setPromptTopic('payment_reminder');
  };

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
    } else if (selectedScenario) {
      intent = selectedScenario.instructions;
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
          model,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isMissingKey) {
          setErrorMessage(
            'The NVIDIA API key is not set. A demo response is shown below; the admin can add the key on the Settings page to enable live generation.'
          );
          // High-quality simulated fallback
          setGeneratedOutput(getFallbackMessage(promptTopic, recipientName, language));
        } else {
          setErrorMessage(data.error || 'The NVIDIA API request failed.');
        }
      } else {
        setGeneratedOutput(data.generatedMessage || '');
        if (data.generatedMessage) onMessageGenerated?.(data.generatedMessage);
      }
    } catch (err: any) {
      setErrorMessage('Unable to reach the server. Showing demo output instead.');
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
          `Hello! Your order has been packed and will be dispatched tomorrow. You will receive the tracking link via SMS and WhatsApp. 📦✨ Let us know if you have any other questions!`
        );
      }
    } catch {
      setSimAiReply(
        `Hello! Your order has been packed and will be dispatched tomorrow. You will receive the tracking link via SMS and WhatsApp. 📦✨ Let us know if you have any other questions!`
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const getFallbackMessage = (topic: string, name: string, lang: string) => {
    if (topic === 'payment_reminder') {
      return `Hello *${name}*! 🙏\n\nWe hope you are doing well. This is a gentle reminder about your pending invoice.\n\nPlease complete the payment at your earliest convenience. If you have any questions, simply reply to this message.\n\nThank you! ✨`;
    }
    if (topic === 'festive_offer') {
      return `🎉 *Special Festive Offer for ${name}!* 🎁\n\nFor the next 48 hours only, get *Flat 30% OFF* on all our services!\n\nCoupon code: *FESTIVE30*\nBook now: https://example.com/offer\n\nLimited slots available! 🚀`;
    }
    return `Hello *${name}*! 👋\n\nYour order has been confirmed and handed over to our courier partner. 🚚\n\nTrack it here: https://track.example.com\nThank you for trusting us! ✨`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 via-white to-white p-6 md:p-8 backdrop-blur shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-650 to-green-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <Cpu className="h-6 w-6 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-navy-900">NVIDIA NIM AI Integration Hub</h3>
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-600 border border-green-200">
                NVIDIA Build / NIM
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Generate WhatsApp messages with NVIDIA NIM models and run a 24/7 auto-reply bot
            </p>
          </div>
        </div>

        {onSelectNvidiaScript && (
        <button
          onClick={onSelectNvidiaScript}
          className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 px-3.5 py-2 text-xs font-semibold text-green-600 transition"
        >
          <Bot className="h-4 w-4" />
          View Full AI Bot Script (Baileys + NVIDIA) <ArrowRight className="h-3 w-3" />
        </button>
        )}
      </div>

      {/* API Key Status Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              serverStatus?.configured ? 'bg-green-600 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-slate-600">
            {serverStatus?.configured ? (
              <span className="text-green-600 font-semibold">
                ✓ NVIDIA API key is configured (live NIM inference active)
              </span>
            ) : (
              <span>
                NVIDIA API key not set: the admin can add it on the <a href="/settings" className="text-green-600 underline font-medium">Settings</a> page. (Get a free key at <a href="https://build.nvidia.com" target="_blank" rel="noreferrer" className="text-green-600 underline font-medium">build.nvidia.com</a>.)
              </span>
            )}
          </span>
        </div>
        <span className="text-[11px] text-slate-500">OpenAI-Compatible Endpoint</span>
      </div>

      {/* Main Grid: Generator + Simulator */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: AI Message Generator */}
        <div className="space-y-4 lg:col-span-7 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-green-600" />
              1. AI WhatsApp Message Composer (NVIDIA NIM)
            </span>
            <span className="text-[11px] text-slate-500">Model: {model.split('/')[1]}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                NVIDIA NIM Model
              </label>
              <Select
                ariaLabel="NVIDIA NIM model"
                value={model}
                onChange={setModel}
                menuWidth="w-80"
                options={[
                  { value: 'nvidia/nemotron-3-super-120b-a12b', label: 'Nemotron 3 Super 120B', description: 'Recommended · fast and accurate', icon: <Cpu className="h-4 w-4" /> },
                  { value: 'nvidia/nemotron-3-ultra-550b-a55b', label: 'Nemotron 3 Ultra 550B', description: 'Most capable · slower', icon: <Zap className="h-4 w-4" /> },
                  { value: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B', description: 'Lightweight · quick replies', icon: <Feather className="h-4 w-4" /> },
                ]}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Rahul, Priya"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Purpose / Scenario</label>
              <Select
                ariaLabel="Purpose"
                value={promptTopic}
                onChange={setPromptTopic}
                menuWidth="w-80"
                options={[
                  { value: 'payment_reminder', label: 'Payment Reminder', icon: <Wallet className="h-4 w-4" /> },
                  { value: 'festive_offer', label: 'Festive / Sales Offer', icon: <Gift className="h-4 w-4" /> },
                  { value: 'order_dispatch', label: 'Order Dispatched', icon: <Truck className="h-4 w-4" /> },
                  { value: 'meeting_invite', label: 'Meeting / Demo Call', icon: <CalendarDays className="h-4 w-4" /> },
                  ...scenarios.map((sc) => ({
                    value: `saved:${sc.id}`,
                    label: sc.name,
                    description: sc.instructions,
                    icon: <Bookmark className="h-4 w-4" />,
                    onRemove: () => removeScenario(sc),
                  })),
                  { value: 'custom', label: 'One-off custom message', description: 'Describe it below, not saved', icon: <PenLine className="h-4 w-4" /> },
                ]}
                footer={(close) => (
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      setShowAddScenario(true);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100">
                      <Plus className="h-4 w-4" />
                    </span>
                    Add your own scenario
                  </button>
                )}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Language</label>
              <Select
                ariaLabel="Language"
                value={language}
                onChange={(v) => setLanguage(v as 'Hinglish' | 'Hindi' | 'English')}
                options={[
                  { value: 'Hinglish', label: 'Hinglish', description: 'Hindi + English, Roman script', icon: <Languages className="h-4 w-4" /> },
                  { value: 'Hindi', label: 'Hindi', icon: <span className="w-4 text-center text-xs font-bold">अ</span> },
                  { value: 'English', label: 'English', icon: <span className="w-4 text-center text-xs font-bold">A</span> },
                ]}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tone</label>
              <Select
                ariaLabel="Tone"
                value={tone}
                onChange={setTone}
                options={[
                  { value: 'Polite & Professional', label: 'Polite & Professional', icon: <Briefcase className="h-4 w-4" /> },
                  { value: 'Excited & Urgent', label: 'Excited & Urgent', icon: <Flame className="h-4 w-4" /> },
                  { value: 'Friendly & Casual', label: 'Friendly & Casual', icon: <Smile className="h-4 w-4" /> },
                ]}
              />
            </div>
          </div>

          {promptTopic === 'custom' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Custom Context</label>
              <textarea
                rows={2}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe what you want to send..."
                className={textareaCls}
              />
            </div>
          )}

          {showAddScenario && (
            <AddScenarioDialog
              onClose={() => setShowAddScenario(false)}
              onSaved={(sc) => {
                setScenarios((list) => [...list, sc]);
                setPromptTopic(`saved:${sc.id}`);
                setShowAddScenario(false);
              }}
            />
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full ${btnPrimary}`}
          >
            {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? 'Generating with NVIDIA AI...' : 'Generate WhatsApp Message with NVIDIA AI'}
          </button>

          {errorMessage && (
            <div className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700 border border-amber-200 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Generated Result Box */}
          {generatedOutput && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-green-600">Generated WhatsApp Message:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-slate-600 hover:text-navy-900 flex items-center gap-1 text-[11px]"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => onUseGeneratedMessage(generatedOutput)}
                    className={btnPrimarySm}
                  >
                    Send this message →
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-[#efeae2] p-3.5 border border-slate-200 text-xs text-navy-900 whitespace-pre-wrap font-sans leading-relaxed">
                {generatedOutput}
              </div>
            </div>
          )}
        </div>

        {/* Right: 24/7 AI WhatsApp Auto-Reply Simulator */}
        <div className="space-y-4 lg:col-span-5 rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-green-600" />
                2. Live WhatsApp Auto-Reply Simulator
              </span>
              <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded">
                Interactive Test
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Preview how the NVIDIA AI will automatically reply when a customer messages you on WhatsApp:
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Incoming Customer Message
              </label>
              <textarea
                rows={2}
                value={simCustomerMsg}
                onChange={(e) => setSimCustomerMsg(e.target.value)}
                placeholder="Type customer question..."
                className={textareaCls}
              />
            </div>

            <button
              type="button"
              onClick={handleSimulateReply}
              disabled={isSimulating}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 border border-slate-300 disabled:opacity-50"
            >
              {isSimulating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5 text-green-600" />}
              {isSimulating ? 'NVIDIA AI Thinking...' : 'Test NVIDIA AI Auto-Reply'}
            </button>

            {/* Chat Simulation View */}
            <div className="rounded-xl bg-[#efeae2] p-3 border border-slate-200 space-y-2.5 min-h-[140px] flex flex-col justify-end">
              {/* Customer Bubble */}
              <div className="max-w-[85%] self-start rounded-2xl rounded-tl-xs bg-[#f0f2f5] px-3 py-2 text-xs text-navy-900 shadow">
                <span className="text-[10px] text-slate-500 block mb-0.5">Customer:</span>
                {simCustomerMsg}
              </div>

              {/* Bot Reply Bubble */}
              {simAiReply && (
                <div className="max-w-[85%] self-end rounded-2xl rounded-tr-xs bg-[#d9fdd3] px-3 py-2 text-xs text-navy-900 shadow">
                  <span className="text-[10px] text-slate-600 block mb-0.5">NVIDIA AI Bot (Auto-Reply):</span>
                  {simAiReply}
                  <span className="text-[9px] text-slate-500 block text-right mt-1">✓✓ Just now</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>⚡ 24/7 automation without the Meta API</span>
            <span className="text-green-600 font-medium">Headless Socket Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};
