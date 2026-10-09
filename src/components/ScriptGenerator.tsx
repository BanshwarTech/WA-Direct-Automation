import React, { useState } from 'react';
import { ScriptTemplate, ScriptLanguage } from '../types';
import { Copy, Check, Download, Terminal, Play, Cpu, CheckCircle2, FileCode, Shield, Zap } from 'lucide-react';

interface Props {
  scripts: ScriptTemplate[];
  selectedScriptId: ScriptLanguage;
  setSelectedScriptId: (id: ScriptLanguage) => void;
}

export const ScriptGenerator: React.FC<Props> = ({
  scripts,
  selectedScriptId,
  setSelectedScriptId,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);

  const currentScript = scripts.find((s) => s.id === selectedScriptId) || scripts[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentScript.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(currentScript.setupCommands);
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentScript.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentScript.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur shadow-xl space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileCode className="h-4 w-4" />
            </span>
            <h3 className="text-xl font-bold text-white">Direct Non-Web Scripts (बिना WhatsApp Web के)</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            ये स्क्रिप्ट्स बैकग्राउंड में शुद्ध सॉकेट या ADB के ज़रिए सीधे मैसेज भेजती हैं — कोई ब्राउज़र नहीं खुलता!
          </p>
        </div>

        {/* Script Selection Tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-950 p-1.5 border border-slate-800">
          {scripts.map((script) => (
            <button
              key={script.id}
              onClick={() => setSelectedScriptId(script.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedScriptId === script.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <span>{script.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Script Overview Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-bold text-white">{currentScript.name}</h4>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              {currentScript.badge}
            </span>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-300 border border-cyan-500/20">
              🚫 No WhatsApp Web Browser UI
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {currentScript.description}
          </p>

          <div className="pt-2 grid gap-3 sm:grid-cols-2 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-emerald-400">✅ फायदे (Pros):</span>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                {currentScript.pros.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-amber-400">⚠️ ध्यान दें (Considerations):</span>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                {currentScript.cons.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Prerequisites */}
        <div className="md:col-span-4 rounded-xl bg-slate-900 p-4 border border-slate-800 text-xs space-y-3">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-emerald-400" /> सिस्टम आवश्यकताएं (Requirements)
          </div>
          <ul className="space-y-2 text-slate-300">
            {currentScript.prerequisites.map((req, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Step 1: Terminal Setup commands */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" /> 1. टर्मिनल सेटअप कमांड (Setup Command)
          </span>
          <button
            onClick={handleCopyInstall}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            {copiedInstall ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedInstall ? 'Copied!' : 'Copy Command'}
          </button>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0d1117] p-3.5 font-mono text-xs text-emerald-400">
          <pre className="whitespace-pre-wrap">{currentScript.setupCommands}</pre>
        </div>
      </div>

      {/* Step 2: Code block */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Play className="h-3.5 w-3.5 text-emerald-400" /> 2. स्क्रिप्ट कोड ({currentScript.filename})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-750 hover:text-white border border-slate-700 transition"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedCode ? 'Code Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={handleDownloadFile}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              Download {currentScript.filename}
            </button>
          </div>
        </div>

        <div className="relative rounded-xl border border-slate-800 bg-[#0d1117] p-4 font-mono text-xs text-slate-200 max-h-[440px] overflow-y-auto">
          <pre className="whitespace-pre-wrap leading-relaxed">{currentScript.code}</pre>
        </div>
      </div>

      {/* Execution Instructions */}
      <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800 text-xs space-y-2">
        <div className="font-semibold text-white flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-emerald-400" />
          इसे चलाने का सबसे आसान तरीका (Step-by-Step):
        </div>
        <ol className="list-decimal list-inside text-slate-300 space-y-1.5 leading-relaxed">
          <li>अपने कंप्यूटर पर एक फोल्डर बनाएं और स्टेप 1 वाली सेटअप कमांड रन करें।</li>
          <li>कोड को <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">{currentScript.filename}</code> के नाम से सेव करें।</li>
          <li>
            रन करें: <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">node {currentScript.filename}</code> (या <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">bash {currentScript.filename}</code>).
          </li>
          <li>
            बैकग्राउंड में सीधा सॉकेट कनेक्ट होकर बिना कोई ब्राउज़र खोले सेकंड्स में मैसेज भेज देगा!
          </li>
        </ol>
      </div>
    </div>
  );
};
