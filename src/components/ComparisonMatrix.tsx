import React from 'react';
import { Check, X, ShieldAlert, Sparkles, Scale, EyeOff } from 'lucide-react';

export const ComparisonMatrix: React.FC = () => {
  const rows = [
    {
      feature: 'क्या स्क्रीन पर WhatsApp Web या Chrome खुलेगा?',
      metaApi: { val: 'नहीं (REST API)', ok: true },
      baileys: { val: 'नहीं (0% Browser, शुद्ध हेडलेस सॉकेट)', ok: true },
      localApi: { val: 'नहीं (बैकग्राउंड API डेमन)', ok: true },
      adb: { val: 'नहीं (सीधा असली फोन ऐप)', ok: true },
    },
    {
      feature: 'Meta / Facebook Account Needed?',
      metaApi: { val: 'YES (Mandatory Developer Account)', ok: false },
      baileys: { val: 'NO (Zero Meta Account)', ok: true },
      localApi: { val: 'NO (Zero Meta Account)', ok: true },
      adb: { val: 'NO (Zero Meta Account)', ok: true },
    },
    {
      feature: 'Cost per Message (लागत)',
      metaApi: { val: 'Paid (~₹0.50 - ₹1.50 per msg)', ok: false },
      baileys: { val: '100% Free (₹0)', ok: true },
      localApi: { val: '100% Free (₹0)', ok: true },
      adb: { val: '100% Free (₹0)', ok: true },
    },
    {
      feature: 'Credit Card / Business Approval',
      metaApi: { val: 'Strict Verification Required', ok: false },
      baileys: { val: 'None (Instant setup)', ok: true },
      localApi: { val: 'None (Instant setup)', ok: true },
      adb: { val: 'None (Just USB/WiFi ADB)', ok: true },
    },
    {
      feature: 'मैसेज ट्रिगर करने का तरीका',
      metaApi: { val: 'Cloud Bearer Token', ok: null },
      baileys: { val: 'Node.js Script Run', ok: true },
      localApi: { val: '1-Line cURL / POST Endpoint', ok: true },
      adb: { val: 'टर्मिनल Bash / ADB Command', ok: true },
    },
    {
      feature: 'Background / VPS Linux Support',
      metaApi: { val: 'Yes', ok: true },
      baileys: { val: 'Yes (RAM <40MB)', ok: true },
      localApi: { val: 'Yes (Self-hosted server)', ok: true },
      adb: { val: 'Needs connected Android phone', ok: null },
    },
    {
      feature: 'Multimedia (Images, Docs, Audio)',
      metaApi: { val: 'Supported', ok: true },
      baileys: { val: 'Full support (Buffers, URLs)', ok: true },
      localApi: { val: 'Full support', ok: true },
      adb: { val: 'Android file share intent', ok: true },
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur shadow-xl space-y-6">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
          <Scale className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-xl font-bold text-white">Direct Non-Web Methods Comparison</h3>
          <p className="text-sm text-slate-400">
            Meta Cloud API बनाम बिना किसी ब्राउज़र वाले शुद्ध डायरेक्ट तरीके
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3.5">Feature</th>
              <th className="p-3.5 text-red-400">Meta Cloud API (Official Paid)</th>
              <th className="p-3.5 text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                1. Baileys (Headless Socket)
              </th>
              <th className="p-3.5 text-blue-400">2. Local REST Gateway (cURL)</th>
              <th className="p-3.5 text-purple-400">3. Android ADB (Real Phone)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-850/40">
                <td className="p-3.5 font-medium text-white">{row.feature}</td>
                <td className="p-3.5 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    {row.metaApi.ok === false && <X className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                    {row.metaApi.ok === true && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                    <span>{row.metaApi.val}</span>
                  </div>
                </td>
                <td className="p-3.5 text-slate-200 bg-emerald-950/10 border-x border-emerald-500/10">
                  <div className="flex items-center gap-1.5">
                    {row.baileys.ok === true && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                    {row.baileys.ok === false && <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                    <span className="font-semibold text-emerald-300">{row.baileys.val}</span>
                  </div>
                </td>
                <td className="p-3.5 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    {row.localApi.ok === true && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                    {row.localApi.ok === false && <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                    <span>{row.localApi.val}</span>
                  </div>
                </td>
                <td className="p-3.5 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    {row.adb.ok === true && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                    {row.adb.ok === false && <X className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
                    <span>{row.adb.val}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
