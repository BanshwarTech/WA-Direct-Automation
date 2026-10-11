import React, { useId } from 'react';

// Brand mark: a glossy green squircle with a chat bubble carrying a "send" arrow (direct WhatsApp sending)
export const LogoMark: React.FC<{ className?: string }> = ({ className = 'h-11 w-11' }) => {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" className={`shrink-0 drop-shadow-[0_6px_14px_rgba(22,163,74,0.35)] ${className}`} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4ADE80" />
          <stop offset="0.45" stopColor="#16A34A" />
          <stop offset="1" stopColor="#065F46" />
        </linearGradient>
        <linearGradient id={`${uid}-arrow`} x1="18" y1="18" x2="31" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22C55E" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${uid}-bg)`} />
      {/* top gloss */}
      <path d="M0 14C0 6.27 6.27 0 14 0h20c7.73 0 14 6.27 14 14v4c-8 5.5-40 5.5-48 0v-4Z" fill="#fff" fillOpacity=".16" />
      <rect x=".75" y=".75" width="46.5" height="46.5" rx="13.25" stroke="#fff" strokeOpacity=".22" strokeWidth="1.5" fill="none" />
      {/* chat bubble */}
      <path
        d="M24 10.5c-7.73 0-14 5.54-14 12.38 0 3.38 1.53 6.44 4.02 8.68L12.6 37.2l6.06-2.72c1.66.53 3.46.82 5.34.82 7.73 0 14-5.54 14-12.38S31.73 10.5 24 10.5Z"
        fill="#fff"
      />
      {/* send arrow */}
      <path d="M18.4 18.3 31 22.9l-12.6 4.6 2.4-4.6-2.4-4.6Z" fill={`url(#${uid}-arrow)`} />
      <path d="M20.8 22.9h5.4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
};

interface LogoProps {
  /** "light" for white backgrounds, "dark" for navy backgrounds */
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  /** Show the "No Meta Account" badge */
  badge?: boolean;
  /** Show the one-line tagline under the name (hidden on small screens) */
  tagline?: boolean;
  className?: string;
}

const SIZES = {
  sm: { mark: 'h-8 w-8', name: 'text-base', gap: 'gap-2' },
  md: { mark: 'h-11 w-11', name: 'text-[19px]', gap: 'gap-3' },
  lg: { mark: 'h-14 w-14', name: 'text-3xl', gap: 'gap-4' },
};

// Full lockup: mark + "WA Direct Automation" wordmark, optional badge and tagline
export const Logo: React.FC<LogoProps> = ({ tone = 'light', size = 'md', badge = false, tagline = false, className = '' }) => {
  const s = SIZES[size];
  const dark = tone === 'dark';
  return (
    <span className={`flex items-center ${s.gap} ${className}`}>
      <LogoMark className={s.mark} />
      <span className="min-w-0 leading-none">
        <span className="flex items-center gap-2">
          <span className={`whitespace-nowrap font-display font-extrabold tracking-[-0.03em] ${s.name} ${dark ? 'text-white' : 'text-navy-900'}`}>
            WA Direct{' '}
            <span
              className={`bg-clip-text text-transparent ${
                dark ? 'bg-gradient-to-r from-emerald-300 to-wa' : 'bg-gradient-to-r from-green-600 to-emerald-500'
              }`}
            >
              Automation
            </span>
          </span>
          {badge && (
            <span
              className={`hidden whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide md:inline-flex ${
                dark ? 'border border-wa/30 bg-wa/10 text-wa' : 'border border-green-200 bg-green-50 text-green-700'
              }`}
            >
              No Meta Account
            </span>
          )}
        </span>
        {tagline && (
          <span className={`mt-1 hidden text-[11px] font-medium sm:block ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            WhatsApp automation without Meta or credit cards
          </span>
        )}
      </span>
    </span>
  );
};
