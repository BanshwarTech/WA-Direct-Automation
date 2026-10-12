import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, HelpCircle, Pencil, X } from 'lucide-react';
import { btnPrimary, btnSecondary, inputCls } from './ui';

// Designed replacements for window.confirm / window.prompt. Call confirmDialog() or promptDialog()
// from anywhere; <DialogHost /> (mounted once in App) renders the dialog and resolves the promise.

interface BaseOptions {
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" shows a red icon and button, for deletes and other destructive actions */
  tone?: 'default' | 'danger';
  icon?: React.ReactNode;
}

interface PromptOptions extends BaseOptions {
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
}

type Request =
  | { kind: 'confirm'; opts: BaseOptions; resolve: (v: boolean) => void }
  | { kind: 'prompt'; opts: PromptOptions; resolve: (v: string | null) => void };

let show: ((r: Request) => void) | null = null;

export function confirmDialog(opts: BaseOptions): Promise<boolean> {
  // Fallback before the host has mounted (should not happen in practice)
  if (!show) return Promise.resolve(window.confirm(opts.title));
  return new Promise((resolve) => show!({ kind: 'confirm', opts, resolve }));
}

export function promptDialog(opts: PromptOptions): Promise<string | null> {
  if (!show) return Promise.resolve(window.prompt(opts.title, opts.defaultValue));
  return new Promise((resolve) => show!({ kind: 'prompt', opts, resolve }));
}

const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-red-500 to-red-700 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(220,38,38,0.8)] transition-all hover:from-red-600 hover:to-red-800 active:scale-[0.98] cursor-pointer';

export const DialogHost: React.FC = () => {
  const [req, setReq] = useState<Request | null>(null);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    show = (r) => {
      setValue(r.kind === 'prompt' ? r.opts.defaultValue ?? '' : '');
      setReq(r);
    };
    return () => {
      show = null;
    };
  }, []);

  const close = (ok: boolean) => {
    if (!req) return;
    if (req.kind === 'confirm') req.resolve(ok);
    else req.resolve(ok ? value.trim() : null);
    setReq(null);
  };

  useEffect(() => {
    if (!req) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(false);
    document.addEventListener('keydown', onKey);
    // Focus the input (prompt) or the confirm button (confirm) so Enter works straight away
    requestAnimationFrame(() => (req.kind === 'prompt' ? inputRef.current?.select() : confirmRef.current?.focus()));
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when a dialog opens (Escape never reads `value`)
  }, [req]);

  if (!req) return null;
  const { opts } = req;
  const danger = opts.tone === 'danger';
  const icon =
    opts.icon ??
    (danger ? <AlertTriangle className="h-5 w-5" /> : req.kind === 'prompt' ? <Pencil className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm" onMouseDown={() => close(false)}>
      <form
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onSubmit={(e) => {
          e.preventDefault();
          if (req.kind === 'prompt' && !value.trim()) return;
          close(true);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
                danger ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-600/30' : 'bg-gradient-to-br from-green-500 to-emerald-700 shadow-green-600/30'
              }`}
            >
              {icon}
            </span>
            <div className="pt-0.5">
              <h3 id="dialog-title" className="text-lg font-bold leading-snug text-navy-900">
                {opts.title}
              </h3>
              {opts.message && <div className="mt-1 text-sm leading-relaxed text-slate-500">{opts.message}</div>}
            </div>
          </div>
          <button type="button" onClick={() => close(false)} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-navy-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        {req.kind === 'prompt' && (
          <label className="mt-5 block">
            {req.opts.label && <span className="text-sm font-semibold text-navy-900">{req.opts.label}</span>}
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={req.opts.maxLength}
              placeholder={req.opts.placeholder}
              className={`mt-1.5 ${inputCls}`}
            />
            {req.opts.maxLength && <span className="mt-1 block text-right text-[11px] text-slate-400">{value.length}/{req.opts.maxLength}</span>}
          </label>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => close(false)} className={btnSecondary}>
            {opts.cancelLabel ?? 'Cancel'}
          </button>
          <button
            ref={confirmRef}
            type="submit"
            disabled={req.kind === 'prompt' && !value.trim()}
            className={`${danger ? btnDanger : btnPrimary} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {opts.confirmLabel ?? 'OK'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};
