// Shared form-field styles so inputs, textareas and <Select> triggers line up everywhere
// (same height, radius, border, text size and focus ring as the custom dropdown).
const fieldBase =
  'w-full rounded-xl border border-slate-300 bg-white text-sm text-navy-900 placeholder-slate-400 shadow-sm transition hover:border-slate-400 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/15';

export const inputCls = `${fieldBase} px-3.5 py-2.5`;
export const textareaCls = `${fieldBase} px-3.5 py-3 leading-relaxed`;

// Primary action button, matching the Send Message button everywhere
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-green-500 to-green-700 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(22,163,74,0.8)] transition-all hover:from-green-600 hover:to-green-800 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

// Compact variant for toolbars, table rows and inline actions
export const btnPrimarySm =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-green-500 to-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_8px_18px_-10px_rgba(22,163,74,0.8)] transition-all hover:from-green-600 hover:to-green-800 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

// Secondary button with the same size and shape as btnPrimary (the 1px border is absorbed by the padding)
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-[11px] text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-navy-900 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';
