import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

// Floating "back to top" button: appears after scrolling down; shows how far you've scrolled (ring + %),
// and swaps the percentage for an arrow on hover
export const BackToTop: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const visible = progress > 0.12;
  const circumference = 2 * Math.PI * 26;
  const pct = Math.round(progress * 100);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={`Back to top (${pct}% scrolled)`}
      title="Back to top"
      className={`group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-white shadow-[0_12px_30px_-10px_rgba(10,31,51,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-800 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <svg aria-hidden viewBox="0 0 56 56" className="absolute inset-0 h-14 w-14 -rotate-90">
        <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
        <circle
          cx="28"
          cy="28"
          r="26"
          fill="none"
          stroke="#25d366"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <span className="relative text-xs font-bold tabular-nums transition duration-200 group-hover:scale-75 group-hover:opacity-0">{pct}%</span>
      <ArrowUp className="absolute h-5 w-5 scale-75 opacity-0 transition duration-200 group-hover:scale-100 group-hover:opacity-100" />
    </button>
  );
};
