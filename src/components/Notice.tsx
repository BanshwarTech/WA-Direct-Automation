import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

type Tone = 'success' | 'error' | 'warning' | 'info';

const styles: Record<Tone, { box: string; icon: React.ReactNode }> = {
  success: { box: 'border-green-200 bg-green-50 text-green-700', icon: <CheckCircle2 className="h-4 w-4" /> },
  error: { box: 'border-red-200 bg-red-50 text-red-700', icon: <AlertCircle className="h-4 w-4" /> },
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-800', icon: <AlertTriangle className="h-4 w-4" /> },
  info: { box: 'border-sky-200 bg-sky-50 text-sky-800', icon: <Info className="h-4 w-4" /> },
};

// Inline status message (success / error / warning / info) with an optional dismiss button
export const Notice: React.FC<{
  tone: Tone;
  children: React.ReactNode;
  onDismiss?: () => void;
  /** Smaller text for notices inside compact areas */
  compact?: boolean;
  className?: string;
}> = ({
  tone,
  children,
  onDismiss,
  compact = false,
  className = '',
}) => (
  <div
    role={tone === 'error' ? 'alert' : 'status'}
    className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left shadow-sm ${compact ? 'text-xs' : 'text-sm'} ${styles[tone].box} ${className}`}
  >
    <span className="mt-0.5 shrink-0">{styles[tone].icon}</span>
    <div className="min-w-0 flex-1 leading-relaxed">{children}</div>
    {onDismiss && (
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="-mr-1 shrink-0 rounded-md p-0.5 opacity-60 transition hover:bg-black/5 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);
