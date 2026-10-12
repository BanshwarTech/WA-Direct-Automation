import React, { useEffect, useState } from 'react';
import { Check, Copy, Eye, EyeOff, FileCode, KeyRound, Loader2, RefreshCw, Server } from 'lucide-react';
import { PageShell, Highlight } from '../components/PageShell';
import { ScriptGenerator } from '../components/ScriptGenerator';
import { ScriptLanguage, ScriptTemplate } from '../types';
import { useAuth } from '../auth/AuthContext';
import { confirmDialog } from '../components/Dialog';

interface Props {
  scripts: ScriptTemplate[];
  selectedScriptId: ScriptLanguage;
  setSelectedScriptId: (id: ScriptLanguage) => void;
}

const apiExample = (key: string) => `curl -X POST http://localhost:3000/api/wa/send \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"phone": "919876543210", "message": "Your order has been dispatched."}'`;

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  return { copied, copy };
}

// The logged-in user's API key: messages sent with it go out from that user's linked WhatsApp
const ApiKeyPanel: React.FC<{ apiKey: string | null; onRegenerate: () => void; busy: boolean }> = ({ apiKey, onRegenerate, busy }) => {
  const [show, setShow] = useState(false);
  const { copied, copy } = useCopy();
  const masked = apiKey ? `${apiKey.slice(0, 8)}${'•'.repeat(24)}` : '';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-navy-900">
        <KeyRound className="h-4 w-4 text-green-600" /> Your API key
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <code className="flex-1 truncate font-mono text-xs text-navy-900">{apiKey ? (show ? apiKey : masked) : 'Loading…'}</code>
        <button type="button" onClick={() => setShow((s) => !s)} disabled={!apiKey} className="text-slate-400 hover:text-navy-900" aria-label={show ? 'Hide key' : 'Show key'}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <button type="button" onClick={() => apiKey && copy('key', apiKey)} disabled={!apiKey} className="text-slate-400 hover:text-navy-900" aria-label="Copy key">
          {copied === 'key' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>Keep it secret. Anyone with this key can send messages from your WhatsApp.</span>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-1 font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Regenerate
        </button>
      </div>
    </div>
  );
};

export const ScriptsPage: React.FC<Props> = ({ scripts, selectedScriptId, setSelectedScriptId }) => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { copied, copy } = useCopy();

  useEffect(() => {
    if (!user) return setApiKey(null);
    fetch('/api/auth/api-key')
      .then((r) => r.json())
      .then((d) => setApiKey(d.apiKey ?? null))
      .catch(() => setApiKey(null));
  }, [user]);

  const regenerate = async () => {
    const ok = await confirmDialog({
      title: 'Generate a new API key?',
      message: 'Scripts and integrations using the current key will stop working until you update them with the new one.',
      confirmLabel: 'Generate new key',
      tone: 'danger',
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch('/api/auth/api-key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const d = await res.json();
      if (d.apiKey) setApiKey(d.apiKey);
    } finally {
      setBusy(false);
    }
  };

  // The visible example keeps the key masked; Copy puts the real key on the clipboard
  const example = apiExample(apiKey ?? 'YOUR_API_KEY');
  const exampleShown = apiExample(apiKey ? `${apiKey.slice(0, 8)}…` : 'YOUR_API_KEY');

  return (
    <PageShell
      eyebrow="Scripts"
      icon={<FileCode className="h-3.5 w-3.5" />}
      title={<>Automation <Highlight>scripts</Highlight></>}
      description="Run WhatsApp automation outside this app: an AI auto-reply bot, Android ADB, Python, and more. Pick a script, copy the setup commands, and download it. Scripts use the phone number and message from the Send Messages page."
    >
      <ScriptGenerator scripts={scripts} selectedScriptId={selectedScriptId} setSelectedScriptId={setSelectedScriptId} />

      {/* Built-in API with the user's own key */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 grid gap-6 lg:grid-cols-5 shadow-[0_1px_2px_rgba(10,31,51,0.04),0_12px_32px_-12px_rgba(10,31,51,0.14)]">
        <div className="lg:col-span-2 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-navy-900 font-bold">
              <Server className="h-4 w-4 text-green-600" /> Sending from your own software?
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              You may not need a script. One HTTP request with your API key sends a message from your linked WhatsApp.
            </p>
          </div>
          {user ? (
            <ApiKeyPanel apiKey={apiKey} onRegenerate={regenerate} busy={busy} />
          ) : (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-slate-700">
              <a href="/register" className="font-semibold text-green-700 hover:underline">
                Create a free account
              </a>{' '}
              or{' '}
              <a href="/login" className="font-semibold text-green-700 hover:underline">
                log in
              </a>{' '}
              to get your personal API key.
            </div>
          )}
        </div>
        <div className="lg:col-span-3 self-center rounded-xl border border-slate-800 bg-[#0d1117] overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 text-xs text-slate-400">
            <span>cURL</span>
            <button type="button" onClick={() => copy('example', example)} className="flex items-center gap-1 hover:text-white">
              {copied === 'example' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === 'example' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-emerald-300 font-mono">{exampleShown}</pre>
        </div>
      </section>
    </PageShell>
  );
};
