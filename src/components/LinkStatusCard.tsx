import React from 'react';
import { CheckCheck, QrCode, ServerOff } from 'lucide-react';
import { WaStatus } from '../hooks/useWaStatus';

// Compact link-status card shown in the Send Messages page header
export const LinkStatusCard: React.FC<{ waStatus: WaStatus | null }> = ({ waStatus }) => {
  const linked = Boolean(waStatus?.ready);
  const { icon: Icon, title, text, tone } =
    waStatus === null
      ? { icon: ServerOff, title: 'Server offline', text: 'Run npm run dev and refresh.', tone: 'from-red-500 to-red-700 shadow-red-600/30' }
      : linked
        ? {
            icon: CheckCheck,
            title: 'WhatsApp linked',
            text: waStatus.user ? `Sending as +${waStatus.user}` : 'Ready to send',
            tone: 'from-green-500 to-emerald-700 shadow-green-600/30',
          }
        : { icon: QrCode, title: 'Not linked yet', text: 'Scan the QR code below.', tone: 'from-amber-400 to-amber-600 shadow-amber-500/30' };

  return (
    <div className="flex items-center gap-3 self-start rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-[0_18px_40px_-18px_rgba(10,31,51,0.35)] backdrop-blur-md md:self-auto">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <div className="text-sm font-bold text-navy-900">{title}</div>
        <div className="text-xs text-slate-500">{text}</div>
      </div>
    </div>
  );
};
