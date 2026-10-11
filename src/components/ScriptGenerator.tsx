import React, { useState } from 'react';
import { ScriptTemplate, ScriptLanguage } from '../types';
import { Copy, Check, Download, Terminal, Play, Cpu, CheckCircle2, FileCode, Shield, Zap } from 'lucide-react';
import { btnPrimarySm } from './ui';

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
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 space-y-6 shadow-[0_1px_2px_rgba(10,31,51,0.04),0_12px_32px_-12px_rgba(10,31,51,0.14)]">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-md shadow-green-600/30">
              <FileCode className="h-4 w-4" />
            </span>
            <h3 className="text-xl font-bold text-navy-900">Direct Non-Web Scripts</h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            These scripts send messages directly in the background over a socket connection or ADB, without opening a browser.
          </p>
        </div>

        {/* Script Selection Tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-white p-1.5 border border-slate-200">
          {scripts.map((script) => (
            <button
              key={script.id}
              onClick={() => setSelectedScriptId(script.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedScriptId === script.id
                  ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                  : 'text-slate-500 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              <span>{script.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Script Overview Card */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-bold text-navy-900">{currentScript.name}</h4>
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600 border border-green-200">
              {currentScript.badge}
            </span>
            <span className="rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-700 border border-cyan-200">
              🚫 No WhatsApp Web Browser UI
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {currentScript.description}
          </p>

          <div className="pt-2 grid gap-3 sm:grid-cols-2 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-green-600">✅ Pros:</span>
              <ul className="list-disc list-inside text-slate-500 space-y-1">
                {currentScript.pros.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-amber-600">⚠️ Considerations:</span>
              <ul className="list-disc list-inside text-slate-500 space-y-1">
                {currentScript.cons.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Prerequisites */}
        <div className="md:col-span-4 rounded-xl bg-white p-4 border border-slate-200 text-xs space-y-3">
          <div className="font-semibold text-navy-900 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-green-600" /> Requirements
          </div>
          <ul className="space-y-2 text-slate-600">
            {currentScript.prerequisites.map((req, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Step 1: Terminal Setup commands */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600 flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-green-600" /> 1. Setup Commands
          </span>
          <button
            onClick={handleCopyInstall}
            className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
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
          <span className="font-semibold text-slate-600 flex items-center gap-1.5">
            <Play className="h-3.5 w-3.5 text-green-600" /> 2. Script Code ({currentScript.filename})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-navy-900 border border-slate-300 transition"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedCode ? 'Code Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={handleDownloadFile}
              className={btnPrimarySm}
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
      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-2">
        <div className="font-semibold text-navy-900 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-green-600" />
          How to run it (step by step):
        </div>
        <ol className="list-decimal list-inside text-slate-600 space-y-1.5 leading-relaxed">
          <li>Create a folder on your computer and run the setup commands from step 1.</li>
          <li>Save the code as <code className="text-green-600 bg-white px-1 py-0.5 rounded">{currentScript.filename}</code>.</li>
          <li>
            Run: <code className="text-green-600 bg-white px-1 py-0.5 rounded">node {currentScript.filename}</code> (or <code className="text-green-600 bg-white px-1 py-0.5 rounded">bash {currentScript.filename}</code>).
          </li>
          <li>
            The script connects over a socket in the background and sends messages within seconds, without opening a browser.
          </li>
        </ol>
      </div>
    </div>
  );
};
