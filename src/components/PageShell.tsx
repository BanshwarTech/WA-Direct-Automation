import React from 'react';

interface Props {
  eyebrow: string;
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}

// Inner-page layout: full-width header band (same grid + glow language as the home hero), then content
// that overlaps the band slightly for depth.
export const PageShell: React.FC<Props> = ({ eyebrow, icon, title, description, aside, children }) => (
  <>
    <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-white to-[#f5f8fa]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(10,31,51,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,31,51,0.05)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_80%_at_30%_0%,black,transparent)]"
      />
      <div aria-hidden className="pointer-events-none absolute -top-32 right-[-5%] h-[380px] w-[380px] rounded-full bg-wa/20 blur-[110px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-24 pt-12 sm:px-6 md:flex-row md:items-end md:justify-between md:pt-16 lg:px-8">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-700 shadow-sm backdrop-blur">
            {icon}
            {eyebrow}
          </span>
          <h1 className="text-3xl font-black tracking-tight text-navy-900 md:text-5xl">{title}</h1>
          <p className="text-base leading-relaxed text-slate-600 md:text-lg">{description}</p>
        </div>
        {aside}
      </div>
    </section>

    <div className="relative mx-auto -mt-14 max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">{children}</div>
  </>
);

// Gradient brand word used inside page titles
export const Highlight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">{children}</span>
);
