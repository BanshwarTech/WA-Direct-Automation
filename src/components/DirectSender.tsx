import React, { useRef, useState } from 'react';
import { Send, Copy, Check, ExternalLink, Trash2, Smartphone, Users, AlertCircle, Loader2, LogOut, X } from 'lucide-react';
import { Recipient } from '../types';
import { Select } from './Select';
import { inputCls, textareaCls, btnPrimary, btnPrimarySm, btnSecondary } from './ui';
import { countryOptions, DEFAULT_COUNTRY, dialCode } from '../data/countries';
import { WaStatus } from '../hooks/useWaStatus';

// Random 3–8s gap between bulk messages (anti-ban)
const randomDelay = () => 3000 + Math.floor(Math.random() * 5000);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function sendDirect(phone: string, message: string) {
  const res = await fetch('/api/wa/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, message }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Send failed (${res.status})`);
  return data;
}

interface Props {
  phone: string;
  setPhone: (val: string) => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  waStatus: WaStatus | null;
}

export const DirectSender: React.FC<Props> = ({ phone, setPhone, message, setMessage, waStatus }) => {
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>('single');
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY);
  const countryCode = dialCode(countryIso);
  const [copiedLink, setCopiedLink] = useState(false);
  const [bulkInput, setBulkInput] = useState(`919876543210, Rahul\n919811223344, Priya\n919899887766, Amit`);
  const [queue, setQueue] = useState<Recipient[]>([]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);
  const stopBulk = useRef(false);

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

  const handleDirectSend = async () => {
    if (!cleanNumber || !message.trim()) {
      setSendResult({ ok: false, text: 'Please enter both a phone number and a message.' });
      return;
    }
    setSending(true);
    setSendResult(null);
    try {
      await sendDirect(fullPhone, message);
      setSendResult({ ok: true, text: `Message sent to +${fullPhone} ✓` });
    } catch (error: any) {
      setSendResult({ ok: false, text: error.message });
    } finally {
      setSending(false);
    }
  };

  const updateQueueItem = (id: string, patch: Partial<Recipient>) =>
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const handleSendQueueItem = async (item: Recipient) => {
    const personalizedMsg = message.replace(/{name}/gi, item.name);
    updateQueueItem(item.id, { status: 'sending', error: undefined });
    try {
      await sendDirect(item.phone, personalizedMsg);
      updateQueueItem(item.id, { status: 'sent' });
    } catch (error: any) {
      updateQueueItem(item.id, { status: 'failed', error: error.message });
    }
  };

  const handleSendAll = async () => {
    stopBulk.current = false;
    setBulkRunning(true);
    const pending = queue.filter((q) => q.status === 'pending' || q.status === 'failed');
    for (let i = 0; i < pending.length; i++) {
      if (stopBulk.current) break;
      await handleSendQueueItem(pending[i]);
      if (i < pending.length - 1) await sleep(randomDelay());
    }
    setBulkRunning(false);
  };

  const handleLogout = async () => {
    if (!confirm('Unlink WhatsApp from this app?')) return;
    await fetch('/api/wa/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});
  };

  const isLinked = Boolean(waStatus?.ready);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-[0_1px_2px_rgba(10,31,51,0.04),0_12px_32px_-12px_rgba(10,31,51,0.14)]">
      {/* Header and Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-lg font-bold text-navy-900">{activeMode === 'single' ? 'Single message' : 'Bulk messages'}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {activeMode === 'single'
              ? 'Send one message to one number. The contact does not need to be saved.'
              : 'Load a list of numbers and names, then send a personalised message to each with a safe delay.'}
          </p>
        </div>

        <div className="flex rounded-xl bg-white p-1 border border-slate-200">
          <button
            onClick={() => setActiveMode('single')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeMode === 'single'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> Single
          </button>
          <button
            onClick={() => setActiveMode('bulk')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeMode === 'bulk'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" /> Bulk ({queue.length})
          </button>
        </div>
      </div>

      {/* Connected bar (linking happens in the onboarding card above until WhatsApp is linked) */}
      {isLinked && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-white px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-md shadow-green-600/30">
              <Check className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-green-500" />
              </span>
            </span>
            <div className="leading-tight">
              <div className="text-sm font-bold text-navy-900">
                Connected{waStatus?.user ? <> as <span className="font-mono">+{waStatus.user}</span></> : null}
              </div>
              <div className="text-xs text-slate-500">Messages go out from your own number, in the background.</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-3.5 w-3.5" /> Unlink
          </button>
        </div>
      )}

      {activeMode === 'single' ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Inputs Section */}
          <div className="space-y-5 lg:col-span-7">
            {/* Phone input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Recipient WhatsApp Number
              </label>
              <div className="mt-2 flex gap-2">
                <Select
                  ariaLabel="Country code"
                  value={countryIso}
                  onChange={setCountryIso}
                  searchable
                  searchPlaceholder="Search country or code"
                  className="w-52 shrink-0"
                  menuWidth="w-80"
                  options={countryOptions('code-first')}
                />

                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210 (without + or leading 0)"
                    className={inputCls}
                  />
                </div>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 text-slate-500">
                Number without spaces or special characters. (Number will resolve to: <span className="font-mono text-green-600">+{fullPhone}</span>)
              </p>
            </div>

            {/* Message input */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Message Content
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('bold')}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('italic')}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs italic text-slate-600 hover:bg-slate-200"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('strike')}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs line-through text-slate-600 hover:bg-slate-200"
                    title="Strikethrough"
                  >
                    S
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('mono')}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600 hover:bg-slate-200"
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
                className={`mt-2 ${textareaCls}`}
              />

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      'Hello! This is a test message sent without a Meta account.'
                    )
                  }
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
                >
                  📝 Test Message
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      'Hello! Your order has been confirmed. Thank you for choosing us! 🚀'
                    )
                  }
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
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
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
                >
                  📅 Meeting Link Msg
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleDirectSend}
                disabled={!isLinked || sending}
                className={btnPrimary}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? 'Sending...' : isLinked ? 'Send Message' : 'Link WhatsApp first'}
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className={btnSecondary}
              >
                {copiedLink ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copiedLink ? 'Link Copied!' : 'Copy Direct Link'}
              </button>
            </div>

            {sendResult && (
              <div
                className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                  sendResult.ok
                    ? 'border-green-200 bg-green-50 text-green-600'
                    : 'border-red-200 bg-red-50 text-red-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  {sendResult.ok ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                  {sendResult.text}
                </span>
                <button type="button" onClick={() => setSendResult(null)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Live Preview Section */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 bg-[#008069] px-4 py-3 text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                  {cleanNumber ? cleanNumber.slice(-2) : '?'}
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-sm font-semibold">+{fullPhone}</div>
                  <div className="text-[11px] text-white/75">Live preview</div>
                </div>
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Preview</span>
              </div>
              <div className="flex min-h-[220px] flex-col justify-end bg-[#efeae2] p-4">
                <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3.5 py-2.5 text-navy-900 shadow-sm">
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {message || <span className="text-slate-500">Your message will appear here</span>}
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
                    Just now <span className="text-sky-500">✓✓</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                <span>{message.length} characters</span>
                <a href={generatedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-green-700 hover:underline">
                  Open in WhatsApp <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Bulk Queue Mode */
        <div className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-6 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Bulk Recipient List
              </label>
              <p className="text-xs text-slate-500">
                Format: <code className="text-green-600">CountryCodeNumber, Name</code> (One per line)
              </p>
              <textarea
                rows={6}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="919876543210, Rahul&#10;919811223344, Priya"
                className={`font-mono text-xs ${textareaCls}`}
              />
              <button
                type="button"
                onClick={parseBulkRecipients}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-navy-900 hover:bg-slate-200 border border-slate-300 transition"
              >
                Load List into Queue ({bulkInput.split('\n').filter((x) => x.trim()).length} Recipients)
              </button>
            </div>

            <div className="md:col-span-6 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Bulk Message Template (Use <span className="text-green-600">{"{name}"}</span> variable)
              </label>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hello {name}, your update is ready!"
                className={textareaCls}
              />
              <p className="text-xs text-slate-500">
                Tip: <code className="text-green-600">{"{name}"}</code> will automatically be substituted by each recipient's personal name!
              </p>
            </div>
          </div>

          {/* Queue Listing */}
          {queue.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-navy-900 text-sm">
                  Ready Queue ({queue.filter((q) => q.status === 'sent').length}/{queue.length} Sent)
                </h4>
                <div className="flex items-center gap-3">
                  {bulkRunning ? (
                    <button
                      type="button"
                      onClick={() => (stopBulk.current = true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Loader2 className="h-3 w-3 animate-spin" /> Stop
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendAll}
                      disabled={!isLinked || !queue.some((q) => q.status === 'pending' || q.status === 'failed')}
                      className={btnPrimarySm}
                    >
                      <Send className="h-3 w-3" /> Send All (3–8s gap)
                    </button>
                  )}
                  <button
                    onClick={() => setQueue([])}
                    disabled={bulkRunning}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" /> Clear Queue
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-200 max-h-72 overflow-y-auto pr-2">
                {queue.map((item, idx) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400 w-5">#{idx + 1}</span>
                      <div>
                        <div className="font-medium text-navy-900 text-sm">{item.name}</div>
                        <div className="text-xs font-mono text-slate-500">+{item.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'sent' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs text-green-600">
                          <Check className="h-3 w-3" /> Sent
                        </span>
                      ) : item.status === 'sending' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                          <Loader2 className="h-3 w-3 animate-spin" /> Sending
                        </span>
                      ) : (
                        <>
                          {item.status === 'failed' && (
                            <span className="max-w-[220px] truncate text-xs text-red-600" title={item.error}>
                              {item.error}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSendQueueItem(item)}
                            disabled={!isLinked || bulkRunning}
                            className={btnPrimarySm}
                          >
                            <Send className="h-3 w-3" /> {item.status === 'failed' ? 'Retry' : `Send to ${item.name.split(' ')[0]}`}
                          </button>
                        </>
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
