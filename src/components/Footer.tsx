import React from 'react';
import { ArrowUpRight, Github, UserPlus } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { WaStatus } from '../hooks/useWaStatus';
import { REPO_URL, StatusDot, statusInfo } from './Header';
import { Logo } from './Logo';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Send Messages', href: '/send' },
      { label: 'Bulk Sending', href: '/send' },
      { label: 'AI Composer', href: '/ai' },
    ],
  },
  {
    title: 'Scripts',
    links: [
      { label: 'AI Auto-Reply Bot', href: '/scripts' },
      { label: 'Android ADB', href: '/scripts' },
      { label: 'Python & cURL', href: '/scripts' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Troubleshooting', href: '/help' },
      { label: 'Anti-Ban Guidelines', href: '/help' },
      { label: 'FAQ', href: '/help' },
      { label: 'Source code', href: REPO_URL, external: true },
    ],
  },
];

export const Footer: React.FC<{ waStatus: WaStatus | null }> = ({ waStatus }) => {
  const { user } = useAuth();
  return (
  <footer className="relative overflow-hidden bg-navy-950 text-slate-300">
    {/* glowing top edge + faint grid */}
    <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-wa/70 to-transparent" />
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-40 w-[60%] -translate-x-1/2 rounded-full bg-wa/10 blur-3xl" />
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
    />

    <div className="relative mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-12">
        {/* Brand */}
        <div className="space-y-5 lg:col-span-5">
          <a href="/" aria-label="WA Direct Automation home" className="inline-flex">
            <Logo tone="dark" />
          </a>
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">
            Send WhatsApp messages directly from your computer, with AI-assisted writing and no Meta account.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {user ? (
              <a
                href="/send"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-white/20"
              >
                <StatusDot waStatus={waStatus} />
                {statusInfo(waStatus).label}
              </a>
            ) : (
              <a
                href="/register"
                className="inline-flex items-center gap-2 rounded-full border border-wa/30 bg-wa/10 px-3 py-1.5 text-xs font-semibold text-wa hover:border-wa/50"
              >
                <UserPlus className="h-3.5 w-3.5" /> Create free account
              </a>
            )}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-900 hover:bg-slate-100"
            >
              <Github className="h-3.5 w-3.5" /> Star on GitHub
            </a>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-wa">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...('external' in link && link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      className="group inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Oversized outlined wordmark */}
      <div
        aria-hidden
        className="pointer-events-none mt-14 select-none whitespace-nowrap text-center font-display text-[17vw] font-black leading-[0.8] tracking-tighter bg-gradient-to-b from-wa/[0.14] via-white/[0.05] to-transparent bg-clip-text text-transparent lg:text-[200px]"
      >
        WA DIRECT
      </div>

      {/* Bottom bar */}
      <div className="relative flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} WA Direct Automation · Open source · Use responsibly and only message people who expect to hear from you.</p>
        <div className="flex items-center gap-4">
          <a href="/sitemap.xml" className="hover:text-white">
            Sitemap
          </a>
        </div>
      </div>
    </div>
  </footer>
  );
};
