import React from 'react';
import { MessageSquare, ShieldCheck, Terminal, Github, Code2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-650 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 font-black">
            <MessageSquare className="h-5 w-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight">
                WA Direct <span className="text-emerald-400">Automation</span>
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                No Meta Account
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Free WhatsApp Automation without Meta Business Platform or Credit Cards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open Source Multi-Device Protocol</span>
          </div>

          <a
            href="#scripts"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Get Scripts</span>
          </a>
        </div>
      </div>
    </header>
  );
};
