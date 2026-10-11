import React, { useState } from 'react';
import { ChevronDown, HelpCircle, LifeBuoy, Wrench } from 'lucide-react';
import { PageShell, Highlight } from '../components/PageShell';
import { AntiBanTips } from '../components/AntiBanTips';

const TROUBLESHOOTING = [
  {
    problem: '"Unable to reach the server" or "Server offline"',
    fix: 'The app server is not running or is running old code. Stop it with Ctrl + C in the terminal and start it again with npm run dev.',
  },
  {
    problem: '"Port 3000 is already in use"',
    fix: 'Another copy of the app is still running. Close the other terminal, or stop the process that is using port 3000, then start again.',
  },
  {
    problem: 'QR code does not appear',
    fix: 'Wait a few seconds after starting the server. If it still does not appear, restart the server and refresh the page.',
  },
  {
    problem: '"<number> is not on WhatsApp"',
    fix: 'Check the number and country code. The recipient must have an active WhatsApp account.',
  },
  {
    problem: 'AI Composer shows an NVIDIA API error',
    fix: 'Check that NVIDIA_API_KEY in .env is valid, then restart the server. Errors mentioning "end of life" mean the model was retired; choose another model from the list.',
  },
  {
    problem: 'WhatsApp got unlinked',
    fix: 'If you removed the device from your phone, the app shows a fresh QR code automatically. Scan it again to re-link.',
  },
];

const FAQS = [
  {
    q: 'Do I need a Meta Business Account, a credit card, or a Facebook App?',
    a: 'No. The Meta Cloud API requires business verification and per-message fees. This app links to your WhatsApp as a device, the same way WhatsApp Desktop does, so no Meta account is needed.',
  },
  {
    q: 'Does it open WhatsApp Web or Chrome?',
    a: 'No. Messages are sent over WhatsApp\'s own protocol from the server in the background. Nothing opens on screen.',
  },
  {
    q: 'Is my WhatsApp login stored safely?',
    a: 'The session is stored locally in the gateway_auth folder on your computer and never leaves it. Anyone with access to that folder could use your WhatsApp, so do not share it. You can unlink at any time from the Send Messages page or from your phone.',
  },
  {
    q: 'How do I get an NVIDIA API key?',
    a: 'Create a free account at build.nvidia.com, generate an API key (nvapi-...), add it to the .env file as NVIDIA_API_KEY, and restart the server.',
  },
  {
    q: 'Can I send messages from my own software?',
    a: 'Yes. While the app is running and WhatsApp is linked, send a POST request to http://localhost:3000/api/wa/send with { "phone": "91...", "message": "..." }. See the project README for the full API reference.',
  },
  {
    q: 'Can the AI reply to customers automatically?',
    a: 'Yes, with the NVIDIA AI auto-reply script on the Scripts page. Review its replies first: the AI does not know your real order data and may invent details such as amounts or tracking numbers.',
  },
  {
    q: 'Can my number get banned?',
    a: 'Yes, if WhatsApp detects spam-like behaviour. This is not the official business API. Follow the anti-ban guidelines on this page and only message people who expect to hear from you.',
  },
];

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-3">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-md shadow-green-600/30">{icon}</span>
    <h2 className="text-xl font-bold text-navy-900">{title}</h2>
  </div>
);

export const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <PageShell
      eyebrow="Help Center"
      icon={<LifeBuoy className="h-3.5 w-3.5" />}
      title={<>How can we <Highlight>help</Highlight>?</>}
      description="Fix common problems, keep your WhatsApp number safe, and find answers to frequent questions. Setup instructions are in the project README."
    >

      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 space-y-5 shadow-[0_1px_2px_rgba(10,31,51,0.04),0_12px_32px_-12px_rgba(10,31,51,0.14)]">
        <SectionTitle icon={<Wrench className="h-5 w-5" />} title="Troubleshooting" />
        <dl className="grid gap-5 md:grid-cols-2">
          {TROUBLESHOOTING.map((t) => (
            <div key={t.problem} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt className="text-sm font-semibold text-navy-900">{t.problem}</dt>
              <dd className="mt-1 text-sm text-slate-500 leading-relaxed">{t.fix}</dd>
            </div>
          ))}
        </dl>
      </section>

      <AntiBanTips />

      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 space-y-5 shadow-[0_1px_2px_rgba(10,31,51,0.04),0_12px_32px_-12px_rgba(10,31,51,0.14)]">
        <SectionTitle icon={<HelpCircle className="h-5 w-5" />} title="Frequently asked questions" />
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={faq.q} className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                className="w-full flex items-center justify-between gap-4 p-4 text-left text-sm font-semibold text-navy-900 hover:text-green-700"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${openFaq === i ? 'rotate-180 text-green-600' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="border-t border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
};
