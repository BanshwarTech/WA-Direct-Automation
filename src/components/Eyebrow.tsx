import React from 'react';

// Small section label above headings (icon + uppercase text), used the same way on every page.
// Pass the icon sized h-3.5 w-3.5. tone="dark" is for labels on navy backgrounds.
export const Eyebrow: React.FC<{ icon: React.ReactNode; children: React.ReactNode; tone?: 'light' | 'dark'; className?: string }> = ({
  icon,
  children,
  tone = 'light',
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${tone === 'dark' ? 'text-wa' : 'text-green-700'} ${className}`}
  >
    {icon} {children}
  </span>
);
