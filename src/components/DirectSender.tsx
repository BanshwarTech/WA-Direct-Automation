import React, { useState } from 'react';
import { Send, Copy, Check, ExternalLink, Plus, Trash2, Smartphone, Users, Sparkles, AlertCircle } from 'lucide-react';
import { Recipient } from '../types';

interface Props {
  phone: string;
  setPhone: (val: string) => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}

const COUNTRY_CODES = [
  { code: '91', label: 'India (+91)' },
  { code: '1', label: 'USA / Canada (+1)' },
  { code: '44', label: 'UK (+44)' },
  { code: '971', label: 'UAE (+971)' },
  { code: '92', label: 'Pakistan (+92)' },
  { code: '880', label: 'Bangladesh (+880)' },
  { code: '61', label: 'Australia (+61)' },
  { code: '65', label: 'Singapore (+65)' },
  { code: '966', label: 'Saudi Arabia (+966)' },
];

export const DirectSender: React.FC<Props> = ({ phone, setPhone, message, setMessage }) => {
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>('single');
  const [countryCode, setCountryCode] = useState('91');
  const [copiedLink, setCopiedLink] = useState(false);
  const [bulkInput, setBulkInput] = useState(`919876543210, Rahul\n919811223344, Priya\n919899887766, Amit`);
  const [queue, setQueue] = useState<Recipient[]>([]);

  // Calculate full phone with clean digits
  const cleanNumber = phone.replace(/[^0-9]/g, '');
  const fullPhone = cleanNumber.startsWith(countryCode)
    ? cleanNumber
    : `${countryCode}${cleanNumber.replace(/^0+/, '')}`;

  const generatedUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(message)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLaunchWhatsApp = (url?: string) => {
    const targetUrl = url || generatedUrl;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInsertFormat = (tag: string) => {
    if (tag === 'bold') setMessage((prev) => `${prev} *bold text*`);
    if (tag === 'italic') setMessage((prev) => `${prev} _italic text_`);
    if (tag === 'strike') setMessage((prev) => `${prev} ~strikethrough~`);
    if (tag === 'mono') setMessage((prev) => `${prev} \`\`\`monospace\`\`\``);
  };

  const parseBulkRecipients = () => {
    const lines = bulkInput.split('\n').filter((l) => l.trim().length > 0);
    const parsed: Recipient[] = lines.map((line, idx) => {
      const parts = line.split(',').map((p) => p.trim());
      const rawNum = parts[0]?.replace(/[^0-9]/g, '') || '';
      const name = parts[1] || `Recipient ${idx + 1}`;
      return {
        id: `rec-${idx}-${Date.now()}`,
        phone: rawNum,
        name: name,
        status: 'pending',
      };
    });
    setQueue(parsed);
  };

  const handleSendQueueItem = (item: Recipient) => {
    const personalizedMsg = message.replace(/{name}/gi, item.name);
    const targetUrl = `https://api.whatsapp.com/send?phone=${item.phone}&text=${encodeURIComponent(personalizedMsg)}`;
    handleLaunchWhatsApp(targetUrl);

    setQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: 'sent' } : q))
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur shadow-xl">
      {/* Header and Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Smartphone className="h-4 w-4" />
            </span>
            <h3 className="text-xl font-bold text-white">Live Direct WhatsApp Dispatcher</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            मैसेज टेस्ट करें या बिना नंबर सेव किए सीधे WhatsApp पर भेजें — 0 Meta API की ज़रूरत!
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setActiveMode('single')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeMode === 'single'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> Single Send
          </button>
          <button
            onClick={() => setActiveMode('bulk')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeMode === 'bulk'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" /> Bulk Queue ({queue.length})
          </button>
        </div>
      </div>

      {activeMode === 'single' ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Inputs Section */}
          <div className="space-y-5 lg:col-span-7">
            {/* Phone input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Recipient WhatsApp Number (मोबाइल नंबर)
              </label>
              <div className="mt-2 flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      +{c.code} ({c.label.split(' ')[0]})
                    </option>
                  ))}
                </select>

                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210 (बिना + या 0 के)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <p className="mt-1.5 text-xs text-slate-550 text-slate-400">
                Number without spaces or special characters. (Number will resolve to: <span className="font-mono text-emerald-400">+{fullPhone}</span>)
              </p>
            </div>

            {/* Message input */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Message Content (संदेश)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('bold')}
                    className="rounded bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('italic')}
                    className="rounded bg-slate-800 px-2 py-0.5 text-xs italic text-slate-300 hover:bg-slate-700"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('strike')}
                    className="rounded bg-slate-800 px-2 py-0.5 text-xs line-through text-slate-300 hover:bg-slate-700"
                    title="Strikethrough"
                  >
                    S
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('mono')}
                    className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-300 hover:bg-slate-700"
                    title="Monospace"
                  >
                    &lt;/&gt;
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your WhatsApp message here..."
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              />

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      'Namaste! Yeh message test karne ke liye bheja gaya hai bina kisi Meta account ke.'
                    )
                  }
                  className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800"
                >
                  📝 Hindi Test Msg
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      'Hello! Your order has been confirmed. Thank you for choosing us! 🚀'
                    )
                  }
                  className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800"
                >
                  📦 Order Update Msg
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      'Hi there! Please find the meeting link here: https://meet.google.com/xyz-abc'
                    )
                  }
                  className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800"
                >
                  📅 Meeting Link Msg
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleLaunchWhatsApp()}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition-all hover:bg-emerald-400 active:scale-[0.98] shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                Send via WhatsApp Web / App
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-slate-750 hover:text-white"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copiedLink ? 'Link Copied!' : 'Copy Direct Link'}
              </button>
            </div>
          </div>

          {/* Live Preview Section */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                <span>📱 Live WhatsApp Preview</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" /> Real-time
                </span>
              </div>

              {/* Chat Bubble Simulation */}
              <div className="rounded-xl bg-[#0b141a] p-4 border border-slate-850 min-h-[160px] flex flex-col justify-end">
                <div className="max-w-[85%] self-end rounded-2xl rounded-tr-xs bg-[#005c4b] px-3.5 py-2.5 text-white shadow-md">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message || '(Your message text will appear here)'}
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-emerald-200/70">
                    <span>Just now</span>
                    <span>✓✓</span>
                  </div>
                </div>
              </div>

              {/* Generated Protocol URL */}
              <div className="mt-4">
                <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
                  <span>Direct Protocol URL (Generated)</span>
                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="rounded-lg bg-slate-900 p-2.5 font-mono text-xs text-slate-300 break-all select-all border border-slate-800">
                  {generatedUrl}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" /> No Contact Saving Needed
              </div>
              <p className="text-slate-400 leading-relaxed">
                इस Direct URL से रिसीवर का नंबर आपकी फोन कॉन्टैक्ट बुक में सेव किए बिना भी तुरंत चैट खुल जाती है।
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Bulk Queue Mode */
        <div className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-6 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Bulk Recipient List (नंबर और नाम लिस्ट)
              </label>
              <p className="text-xs text-slate-400">
                Format: <code className="text-emerald-400">CountryCodeNumber, Name</code> (One per line)
              </p>
              <textarea
                rows={6}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="919876543210, Rahul&#10;919811223344, Priya"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={parseBulkRecipients}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 border border-slate-700 transition"
              >
                Load List into Queue ({bulkInput.split('\n').filter((x) => x.trim()).length} Recipients)
              </button>
            </div>

            <div className="md:col-span-6 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Bulk Message Template (Use <span className="text-emerald-400">{"{name}"}</span> variable)
              </label>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hello {name}, your update is ready!"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400">
                Tip: <code className="text-emerald-400">{"{name}"}</code> will automatically be substituted by each recipient's personal name!
              </p>
            </div>
          </div>

          {/* Queue Listing */}
          {queue.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white text-sm">
                  Ready Queue ({queue.filter((q) => q.status === 'sent').length}/{queue.length} Sent)
                </h4>
                <button
                  onClick={() => setQueue([])}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Clear Queue
                </button>
              </div>

              <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto pr-2">
                {queue.map((item, idx) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500 w-5">#{idx + 1}</span>
                      <div>
                        <div className="font-medium text-white text-sm">{item.name}</div>
                        <div className="text-xs font-mono text-slate-400">+{item.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'sent' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs text-emerald-400">
                          <Check className="h-3 w-3" /> Sent
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendQueueItem(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                        >
                          <Send className="h-3 w-3" /> Send to {item.name.split(' ')[0]}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
