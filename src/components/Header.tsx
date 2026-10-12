import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, FileCode, KeyRound, LifeBuoy, LogOut, Menu, Send, Sparkles, X } from 'lucide-react';
import { ADMIN_ROUTES, navigate, Route } from '../hooks/useRoute';
import { AuthUser, useAuth } from '../auth/AuthContext';
import { WaStatus } from '../hooks/useWaStatus';
import { btnPrimary } from './ui';
import { Logo } from './Logo';

export const NAV_ITEMS: { route: Route; label: string; href: string; icon: React.ElementType; hint: string }[] = [
  { route: 'send', label: 'Send Messages', href: '/send', icon: Send, hint: 'Single & bulk' },
  { route: 'ai', label: 'AI Composer', href: '/ai', icon: Sparkles, hint: 'Write with AI' },
  { route: 'scripts', label: 'Scripts', href: '/scripts', icon: FileCode, hint: 'Bots & API' },
  { route: 'help', label: 'Help', href: '/help', icon: LifeBuoy, hint: 'Guides & FAQ' },
];

interface Props {
  route: Route;
  waStatus: WaStatus | null;
}

export function statusInfo(waStatus: WaStatus | null) {
  if (waStatus === null) return { label: 'Server offline', dot: 'bg-red-500', ping: false };
  if (waStatus.ready) return { label: 'WhatsApp linked', dot: 'bg-green-500', ping: true };
  return { label: 'Not linked', dot: 'bg-amber-500', ping: false };
}

export const StatusDot: React.FC<{ waStatus: WaStatus | null }> = ({ waStatus }) => {
  const s = statusInfo(waStatus);
  return (
    <span className="relative flex h-2 w-2">
      {s.ping && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-70" />}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`} />
    </span>
  );
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

const formatPhone = (digits: string) => (digits ? `+${digits}` : '');

// Avatar with an optional WhatsApp status dot in the corner
const Avatar: React.FC<{ user: AuthUser; size?: string; waStatus?: WaStatus | null; showStatus?: boolean }> = ({
  user,
  size = 'h-9 w-9 text-xs',
  waStatus,
  showStatus = false,
}) => (
  <span className="relative inline-flex shrink-0">
    <span
      className={`flex ${size} items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-700 font-bold tracking-wide text-white shadow-[0_4px_12px_-4px_rgba(22,163,74,0.7)] ring-2 ring-white`}
    >
      {initials(user.name)}
    </span>
    {showStatus && (
      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white">
        <span className={`h-2.5 w-2.5 rounded-full ${statusInfo(waStatus ?? null).dot}`} />
      </span>
    )}
  </span>
);

// Account trigger + dropdown for logged-in users (shows who is signed in and their WhatsApp link state)
const UserMenu: React.FC<{ user: AuthUser; waStatus: WaStatus | null; onLogout: () => void }> = ({ user, waStatus, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const status = statusInfo(waStatus);
  const linked = Boolean(waStatus?.ready);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const item = 'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-100';
  const firstName = user.name.split(/\s+/)[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        className={`flex items-center gap-2.5 rounded-full border bg-white py-1 pl-1 pr-3 shadow-sm transition ${
          open ? 'border-green-300 ring-4 ring-green-500/10' : 'border-slate-200 hover:border-slate-300 hover:shadow'
        }`}
      >
        <Avatar user={user} waStatus={waStatus} showStatus />
        <span className="hidden text-left leading-tight lg:block">
          <span className="block max-w-[9rem] truncate text-sm font-semibold text-navy-900">{firstName}</span>
          <span className={`block text-[11px] font-medium ${linked ? 'text-green-700' : waStatus ? 'text-amber-700' : 'text-red-600'}`}>
            {status.label}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180 text-green-600' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_60px_-24px_rgba(10,31,51,0.45)]"
        >
          {/* Identity */}
          <div className="relative overflow-hidden bg-navy-900 px-4 pb-4 pt-5 text-white">
            <div aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-wa/25 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <Avatar user={user} size="h-12 w-12 text-base" />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-wa">
                    {user.role === 'owner' ? 'Owner' : 'Member'}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-xs text-slate-300">{user.email}</div>
                {user.phone && <div className="truncate text-xs text-slate-400">{formatPhone(user.phone)}</div>}
              </div>
            </div>
          </div>

          {/* WhatsApp link state */}
          <div className="border-b border-slate-100 p-3">
            <a
              role="menuitem"
              href="/send"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                linked ? 'border-green-200 bg-green-50 hover:bg-green-100/70' : 'border-amber-200 bg-amber-50 hover:bg-amber-100/70'
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                {linked && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-70" />}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${status.dot}`} />
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block text-sm font-semibold text-navy-900">{linked ? 'WhatsApp connected' : 'WhatsApp not linked'}</span>
                <span className="block truncate text-xs text-slate-500">
                  {linked ? (waStatus?.user ? `Sending as +${waStatus.user}` : 'Ready to send') : 'Scan your QR to start'}
                </span>
              </span>
              <span className={`text-xs font-semibold ${linked ? 'text-green-700' : 'text-amber-700'}`}>{linked ? 'Open' : 'Link now'} →</span>
            </a>
          </div>

          {/* Shortcuts */}
          <div className="p-1.5">
            {[
              { href: '/send', icon: Send, label: 'Send Messages', hint: 'Single & bulk sending' },
              { href: '/ai', icon: Sparkles, label: 'AI Composer', hint: 'Write messages with AI' },
              ...(user.role === 'owner'
                ? [{ href: '/scripts', icon: KeyRound, label: 'API key & scripts', hint: 'Automate from your software' }]
                : []),
            ].map((m) => (
              <a key={m.href} role="menuitem" href={m.href} onClick={() => setOpen(false)} className={item}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-white group-hover:text-green-600 group-hover:shadow-sm">
                  <m.icon className="h-4 w-4" />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold text-navy-900">{m.label}</span>
                  <span className="text-xs text-slate-500">{m.hint}</span>
                </span>
              </a>
            ))}
          </div>

          <div className="border-t border-slate-100 p-1.5">
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                <LogOut className="h-4 w-4" />
              </span>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const Header: React.FC<Props> = ({ route, waStatus }) => {
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    await logout();
    navigate('home');
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const status = statusInfo(waStatus);
  // The Scripts page is admin-only, so it is left out of the menus for everyone else
  const navItems = NAV_ITEMS.filter((item) => !ADMIN_ROUTES.includes(item.route) || user?.role === 'owner');

  // Close the mobile menu after navigating
  useEffect(() => setMenuOpen(false), [route]);

  // Transparent over the hero at the top of the page; white glass with a border and shadow once scrolled.
  // Only colours and shadow change, never the height, so the page below does not jump while scrolling.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Main bar */}
      <div
        className={`border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out ${
          scrolled
            ? 'border-slate-200/80 bg-white/80 shadow-[0_10px_30px_-18px_rgba(10,31,51,0.35)] backdrop-blur-xl'
            : 'border-transparent bg-transparent shadow-none'
        }`}
      >
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
          <a href="/" aria-label="WA Direct Automation home" className="shrink-0">
            <Logo badge tagline />
          </a>

          {/* Navigation: plain links; the active page is shown in green */}
          <nav className="hidden xl:flex items-center gap-8" aria-label="Main">
            {navItems.map((item) => {
              const active = route === item.route;
              return (
                <a
                  key={item.route}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`whitespace-nowrap py-2 text-sm font-semibold transition-colors duration-200 ${
                    active ? 'text-green-700' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden sm:block">
                  <UserMenu user={user} waStatus={waStatus} onLogout={handleLogout} />
                </div>
              </>
            ) : (
              <>
                <a href="/login" className="hidden sm:inline-flex whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-100">
                  Log in
                </a>
                <a
                  href="/register"
                  className={`group max-sm:hidden whitespace-nowrap ${btnPrimary} !rounded-full !px-4 !py-2`}
                >
                  Get started <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </a>
              </>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="xl:hidden shrink-0 rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="xl:hidden border-b border-slate-200 bg-white/95 px-4 pb-5 pt-3 shadow-xl backdrop-blur-xl" aria-label="Mobile">
          <div className="grid gap-2 sm:grid-cols-2">
            {navItems.map((item) => {
              const active = route === item.route;
              return (
                <a
                  key={item.route}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                    active ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      active ? 'bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-md shadow-green-600/30' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-sm font-semibold text-navy-900">{item.label}</span>
                    <span className="text-xs text-slate-500">{item.hint}</span>
                  </span>
                </a>
              );
            })}
          </div>
          {user ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3">
              <span className="flex min-w-0 items-center gap-3">
                <Avatar user={user} size="h-10 w-10 text-sm" waStatus={waStatus} showStatus />
                <span className="min-w-0 leading-tight">
                  <span className="block truncate text-sm font-semibold text-navy-900">{user.name}</span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <StatusDot waStatus={waStatus} /> {status.label}
                  </span>
                </span>
              </span>
              <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href="/login" className="rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-navy-900">
                Log in
              </a>
              <a href="/register" className={`w-full ${btnPrimary} !py-2.5`}>
                Get started
              </a>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};
