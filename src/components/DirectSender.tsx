import React, { useRef, useState } from 'react';
import { Send, Copy, Check, ExternalLink, Trash2, Smartphone, Users, AlertCircle, Loader2, LogOut, X, Upload, Download, FileSpreadsheet, Lock, ArrowRight } from 'lucide-react';
import { Recipient } from '../types';
import { Select } from './Select';
import { MessageEditor, WhatsAppText } from './MessageEditor';
import { MessagePicker } from './MessagePicker';
import { useSavedMessages } from '../hooks/useSavedMessages';
import { useBilling } from '../hooks/useBilling';
import { UsageStrip } from './UsageStrip';
import { inputCls, textareaCls, btnPrimary, btnPrimarySm, btnSecondary } from './ui';
import { countryOptions, DEFAULT_COUNTRY, dialCode } from '../data/countries';
import { WaStatus } from '../hooks/useWaStatus';
import { VariableFields } from './VariableFields';
import { confirmDialog } from './Dialog';
import { Notice } from './Notice';
import { toast } from './Toast';
import { extractVariables, fillVariables, variableLabel } from '../utils/variables';
import { downloadSampleSheet, importRecipients } from '../utils/excel';

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
  // limitReached = the plan's monthly messages are used up (HTTP 402)
  if (!res.ok) throw Object.assign(new Error(data.error || `Send failed (${res.status})`), { limitReached: Boolean(data.limitReached) });
  return data;
}

interface Props {
  phone: string;
  setPhone: (val: string) => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  waStatus: WaStatus | null;
  savedMessages: ReturnType<typeof useSavedMessages>;
  billing: ReturnType<typeof useBilling>;
}

export const DirectSender: React.FC<Props> = ({ phone, setPhone, message, setMessage, waStatus, savedMessages, billing }) => {
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>('single');
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY);
  const countryCode = dialCode(countryIso);
  const [copiedLink, setCopiedLink] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [queue, setQueue] = useState<Recipient[]>([]);
  const [sending, setSending] = useState(false);
  const [bulkRunning, setBulkRunning] = useState(false);
  const stopBulk = useRef(false);
  // Values for {variables}, shared by both modes (keyed by variable name, so they survive template switches)
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const setVar = (key: string, value: string) => setVarValues((prev) => ({ ...prev, [key]: value }));
  const [sheetColumns, setSheetColumns] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Calculate full phone with clean digits
  const cleanNumber = phone.replace(/[^0-9]/g, '');
  const fullPhone = cleanNumber.startsWith(countryCode)
    ? cleanNumber
    : `${countryCode}${cleanNumber.replace(/^0+/, '')}`;

  const features = billing.info?.usage.features;
  const canExcel = features?.excelImport ?? true;
  const canSave = features?.savedMessages ?? true;

  const messageVars = extractVariables(message);
  const filledMessage = fillVariables(message, varValues);
  const missingVars = messageVars.filter((v) => !varValues[v]?.trim());
  // Bulk: {name} comes from each row and every other variable from the matching Excel column
  const missingColumns = messageVars.filter((v) => v !== 'name' && !sheetColumns.includes(v));

  const generatedUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(filledMessage)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Pasted list columns follow the message: phone, name, then one column per other {variable}
  const pasteVars = canExcel ? messageVars.filter((v) => v !== 'name') : [];
  const pasteColumns = ['phone', 'name', ...pasteVars];
  // Placeholder shows the column order by variable name, e.g. "phone, name, order_id, courier"
  const pasteExample = pasteColumns.join(', ');

  const parseBulkRecipients = () => {
    const lines = bulkInput.split('\n').filter((l) => l.trim().length > 0);
    const stamp = Date.now();
    const parsed: Recipient[] = lines.map((line, idx) => {
      // Rows copied from Excel are tab-separated; typed rows use commas
      const parts = line.split(line.includes('\t') ? '\t' : ',').map((p) => p.trim());
      const rawNum = parts[0]?.replace(/[^0-9]/g, '') || '';
      const name = parts[1] || `Recipient ${idx + 1}`;
      const customData: Record<string, string> = {};
      pasteVars.forEach((v, i) => {
        if (parts[i + 2]) customData[v] = parts[i + 2];
      });
      return {
        id: `rec-${idx}-${stamp}`,
        phone: rawNum,
        name: name,
        customData,
        status: 'pending',
      };
    });
    setQueue(parsed);
    setSheetColumns(pasteVars);
  };

  const handleImportFile = async (file: File) => {
    setImporting(true);
    try {
      const { recipients, columns, skipped } = await importRecipients(file, dialCode(DEFAULT_COUNTRY));
      if (recipients.length === 0) throw new Error('No valid phone numbers found in the file.');
      setQueue(recipients);
      setSheetColumns(columns);
      toast.success(
        `Loaded ${recipients.length} recipients from ${file.name}` +
          (columns.length ? ` · columns: ${columns.join(', ')}` : '') +
          (skipped ? ` · ${skipped} rows skipped (invalid number)` : '')
      );
    } catch (error: any) {
      toast.error(error.message || 'Could not read the file.');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDirectSend = async () => {
    if (!cleanNumber || !message.trim()) {
      toast.error('Please enter both a phone number and a message.');
      return;
    }
    if (missingVars.length) {
      toast.error(`Fill in the message variables first: ${missingVars.map(variableLabel).join(', ')}.`);
      return;
    }
    setSending(true);
    try {
      await sendDirect(fullPhone, filledMessage);
      toast.success(`Message sent to +${fullPhone}`);
      billing.refresh();
    } catch (error: any) {
      toast.error(
        error.limitReached ? (
          <>
            {error.message}{' '}
            <a href="/pricing" className="font-semibold text-green-700 underline underline-offset-2">
              See plans →
            </a>
          </>
        ) : (
          error.message
        )
      );
    } finally {
      setSending(false);
    }
  };

  const updateQueueItem = (id: string, patch: Partial<Recipient>) =>
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const personalize = (item: Recipient) => fillVariables(message, { ...item.customData, name: item.name });

  /**
   * "skipped" = not sent because variables are missing (no anti-ban delay needed),
   * "limit" = the plan's messages are used up (the item stays pending), "done" = sent or failed
   */
  const handleSendQueueItem = async (item: Recipient): Promise<'skipped' | 'limit' | 'done'> => {
    const personalizedMsg = personalize(item);
    const unfilled = extractVariables(personalizedMsg);
    if (unfilled.length) {
      updateQueueItem(item.id, { status: 'failed', error: `Missing: ${unfilled.map(variableLabel).join(', ')}` });
      return 'skipped';
    }
    updateQueueItem(item.id, { status: 'sending', error: undefined });
    try {
      await sendDirect(item.phone, personalizedMsg);
      updateQueueItem(item.id, { status: 'sent' });
      billing.refresh();
    } catch (error: any) {
      if (error.limitReached) {
        updateQueueItem(item.id, { status: 'pending', error: undefined });
        toast.warning(
          <>
            Bulk sending stopped: your plan&apos;s messages are used up. The remaining recipients are still in the queue.{' '}
            <a href="/pricing" className="font-semibold text-green-700 underline underline-offset-2">
              Upgrade to continue →
            </a>
          </>,
          { duration: 12000 }
        );
        return 'limit';
      }
      updateQueueItem(item.id, { status: 'failed', error: error.message });
    }
    return 'done';
  };

  const handleSendAll = async () => {
    stopBulk.current = false;
    setBulkRunning(true);
    const pending = queue.filter((q) => q.status === 'pending' || q.status === 'failed');
    for (let i = 0; i < pending.length; i++) {
      if (stopBulk.current) break;
      const outcome = await handleSendQueueItem(pending[i]);
      // Out of messages: stop here; the rest stay pending and can be sent after upgrading
      if (outcome === 'limit') break;
      if (outcome === 'done' && i < pending.length - 1) await sleep(randomDelay());
    }
    setBulkRunning(false);
  };

  const handleLogout = async () => {
    const ok = await confirmDialog({
      title: 'Unlink WhatsApp?',
      message: 'Messages will stop sending from this number. To link it again you will need to scan a new QR code.',
      confirmLabel: 'Unlink',
      tone: 'danger',
    });
    if (!ok) return;
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

      <UsageStrip billing={billing} />

      {activeMode === 'single' ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Inputs Section */}
          <div className="min-w-0 space-y-5 lg:col-span-7">
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
                Number without spaces or special characters.
                {cleanNumber && <> (Number will resolve to: <span className="font-mono text-green-600">+{fullPhone}</span>)</>}
              </p>
            </div>

            {/* Message input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Message Content
              </label>
              <div className="mt-2 space-y-2">
                <MessagePicker message={message} setMessage={setMessage} library={savedMessages} canSave={canSave} />
                <MessageEditor
                  value={message}
                  onChange={setMessage}
                  rows={10}
                  placeholder="Type your WhatsApp message here..."
                />
              </div>
            </div>

            <VariableFields variables={messageVars} values={varValues} onChange={setVar} />

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
          </div>

          {/* Live Preview Section */}
          <div className="min-w-0 lg:col-span-5">
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
                    {message ? <WhatsAppText text={filledMessage} /> : <span className="text-slate-500">Your message will appear here</span>}
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
                    Just now <span className="text-sky-500">✓✓</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                <span>{filledMessage.length} characters</span>
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
            <div className="min-w-0 md:col-span-6 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Bulk Recipient List
              </label>

              {/* Excel / CSV upload (Basic / Pro): columns phone, name and one column per {variable} */}
              {!canExcel ? (
                <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-4 text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-200">
                    <Lock className="h-5 w-5" />
                  </span>
                  <p className="mt-2 text-sm font-semibold text-navy-900">Excel upload with variables</p>
                  <p className="mx-auto mt-0.5 max-w-xs text-[11px] text-slate-500">
                    Upload a customer sheet and fill details like order ID or amount for every recipient. Included in Basic and Pro.
                  </p>
                  <a href="/pricing" className={`${btnPrimarySm} mt-3`}>
                    Upgrade to unlock <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-4 text-center">
                  <FileSpreadsheet className="mx-auto h-7 w-7 text-green-600" />
                  <p className="mt-1.5 text-sm font-semibold text-navy-900">Upload an Excel or CSV file</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Columns: <code className="text-green-600">phone</code>, <code className="text-green-600">name</code>, plus one column per message variable
                    {messageVars.filter((v) => v !== 'name').length > 0 && (
                      <> (e.g. <code className="text-green-600">{messageVars.filter((v) => v !== 'name').slice(0, 3).join(', ')}</code>)</>
                    )}
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImportFile(e.target.files[0])}
                  />
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={importing || bulkRunning} className={btnPrimarySm}>
                      {importing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                      {importing ? 'Reading…' : 'Upload Excel / CSV'}
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadSampleSheet(messageVars)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-3 w-3" /> Download sample Excel
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500">
                Or paste one recipient per line: <code className="text-green-600">{pasteColumns.join(', ')}</code>
                {pasteVars.length > 0 && <> (or copy the rows straight from Excel)</>}
              </p>
              <textarea
                rows={6}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder={pasteExample}
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

            <div className="min-w-0 md:col-span-6 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Bulk Message Template (Use <span className="text-green-600">{"{name}"}</span> variable)
              </label>
              <MessagePicker message={message} setMessage={setMessage} library={savedMessages} canSave={canSave} />
              <MessageEditor
                rows={6}
                value={message}
                onChange={setMessage}
                placeholder="Hello {name}, your update is ready!"
                showNameVariable
              />
              <p className="text-xs text-slate-500">
                Tip: <code className="text-green-600">{"{name}"}</code> is filled from each recipient&apos;s name, and other variables from the matching Excel column.
              </p>
              {queue.length > 0 && missingColumns.length > 0 && (
                <Notice tone="warning" compact>
                    {canExcel ? 'The loaded list has no column for' : 'On the Free plan, bulk lists only fill {name}. This message also needs'}{' '}
                    <strong>{missingColumns.map(variableLabel).join(', ')}</strong>.{' '}
                    {canExcel ? (
                      <>
                        Use <em>Download sample Excel</em> to get a sheet with all the right columns.
                      </>
                    ) : (
                      <a href="/pricing" className="font-semibold underline underline-offset-2">
                        Upgrade to fill them per recipient from Excel →
                      </a>
                    )}
                </Notice>
              )}
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
                        {item.customData && Object.keys(item.customData).length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(item.customData).slice(0, 4).map(([k, v]) => (
                              <span key={k} className="max-w-[160px] truncate rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200" title={`${k}: ${v}`}>
                                {variableLabel(k)}: {v}
                              </span>
                            ))}
                          </div>
                        )}
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
