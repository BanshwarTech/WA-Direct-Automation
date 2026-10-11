import React from 'react';
import { ShieldAlert, Clock, Shuffle, UserCheck, Flame, BellOff } from 'lucide-react';

export const AntiBanTips: React.FC = () => {
  const tips = [
    {
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      title: 'Add a random 3–8 second delay between messages',
      desc: 'Sending dozens of messages within seconds can trigger WhatsApp\'s spam detection and get the number blocked. Insert a random delay between every message.'
    },
    {
      icon: <Shuffle className="h-5 w-5 text-green-600" />,
      title: 'Personalize every message',
      desc: 'Avoid sending identical text to hundreds of recipients. Use variables such as "Hello Rahul" and "Hello Priya".'
    },
    {
      icon: <Flame className="h-5 w-5 text-orange-600" />,
      title: 'Warm up new numbers',
      desc: 'For a new SIM or number, send 10–15 messages on day one and 25–30 on day two. A sudden spike of hundreds of messages can get the number flagged.'
    },
    {
      icon: <UserCheck className="h-5 w-5 text-blue-600" />,
      title: 'Message contacts who already know you',
      desc: 'The risk of a ban drops significantly when recipients have saved your number or have chatted with you before.'
    },
    {
      icon: <BellOff className="h-5 w-5 text-purple-600" />,
      title: 'Never send unsolicited messages to strangers',
      desc: 'If several recipients use "Report & Block", WhatsApp may suspend the account automatically. Only message your clients, customers, and known contacts.'
    }
  ];

  return (
    <div className="rounded-3xl border border-amber-200 bg-white p-6 md:p-8 space-y-5 shadow-[0_1px_2px_rgba(10,31,51,0.04),0_12px_32px_-12px_rgba(10,31,51,0.14)]">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/30">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-xl font-bold text-navy-900">
            Anti-Ban Guidelines
          </h3>
          <p className="text-sm text-slate-500">
            Because these methods do not use the official Meta API, follow these five rules to protect your number
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-2">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-slate-300"
          >
            <div className="flex items-center gap-2 mb-2">
              {tip.icon}
              <h4 className="text-xs font-bold text-navy-900 leading-snug">{tip.title}</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
