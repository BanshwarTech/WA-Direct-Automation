import React, { useState } from 'react';
import { ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
import { Eyebrow } from './Eyebrow';

// Home page FAQ: answers the questions visitors ask before signing up. The same text is published as
// FAQPage structured data so search engines can show it as rich results.

export interface FaqItem {
  q: string;
  a: React.ReactNode;
}

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is WA Direct Automation?',
    a: 'A web app for sending WhatsApp messages from your own number: one at a time, or personalised to a whole customer list. Link your WhatsApp once, then write, personalise and send from your browser.',
  },
  {
    q: 'Do I need a Meta Business account or the official WhatsApp API?',
    a: 'No. There is no Meta verification, no Facebook app and no per-message fee. Your WhatsApp is linked as a device, the same way WhatsApp Desktop works, and messages go out from your own number.',
  },
  {
    q: 'How do I connect my WhatsApp?',
    a: 'Create an account, open Send Messages and scan the QR code from WhatsApp on your phone (Settings → Linked Devices → Link a device). It takes under a minute, and you can unlink at any time from the app or from your phone.',
  },
  {
    q: 'Does my phone need to stay online?',
    a: 'No. Like any linked device, the app keeps working while your phone is off or offline. Open WhatsApp on your phone at least once every 14 days so WhatsApp keeps the device linked.',
  },
  {
    q: 'Can I send personalised messages to many customers at once?',
    a: 'Yes. Upload an Excel or CSV file with phone, name and any details you need, such as order ID or amount. Each column fills the matching {variable} in your message, so every customer gets their own details. Messages go out with a random 3–8 second gap to protect your number.',
  },
  {
    q: 'Are there ready-made message templates?',
    a: 'Yes. Professional templates cover orders, payments, renewals, appointments, support and offers, with WhatsApp formatting (bold, italic, lists, quotes) already applied. You can also save your own messages and reuse them anytime.',
  },
  {
    q: 'What does the AI Composer do?',
    a: 'Describe what you need, such as a payment reminder or a festive offer, and the AI writes a polished WhatsApp message in English, Hindi or Hinglish. Every message it generates is kept in your history, ready to send.',
  },
  {
    q: 'Is my data safe?',
    a: 'Your WhatsApp session, saved messages and account are stored on the server running this app, separately for each user. Passwords are stored as secure one-way hashes, and nobody else can send from your number. Unlinking removes the device immediately.',
  },
  {
    q: 'Can my WhatsApp number get banned?',
    a: 'Any number that sends spam can be restricted by WhatsApp. Only message people who know you and expect to hear from you, keep the built-in delay for bulk sends, and follow the anti-ban guidelines in the Help Center.',
  },
];

const faqJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

// Same layout as the Help Center FAQ: left-aligned heading, questions two per row
export const HomeFaq: React.FC = () => (
  <section className="space-y-8">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />

    <div id="faq" className="scroll-mt-28 space-y-2">
      <Eyebrow icon={<HelpCircle className="h-3.5 w-3.5" />}>FAQ</Eyebrow>
      <h2 className="text-2xl font-black tracking-tight text-navy-900 md:text-3xl">
        Frequently asked{' '}
        <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">questions</span>
      </h2>
      <p className="max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
        Everything you need to know before you send your first message.{' '}
        <a href="/help" className="group inline-flex items-center gap-1 font-semibold text-green-700 hover:text-green-800">
          Visit the Help Center <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </a>
      </p>
    </div>

    <FaqAccordion items={FAQS} columns={2} />
  </section>
);

// Accordion with a smooth height animation. Shared by the home page FAQ and the Help Center.
// expandAll opens every item (used while searching so matches are visible); columns={2} shows two per row (equal height) on wide screens.
export const FaqAccordion: React.FC<{ items: FaqItem[]; expandAll?: boolean; idPrefix?: string; columns?: 1 | 2 }> = ({
  items,
  expandAll = false,
  idPrefix = 'faq',
  columns = 1,
}) => {
  // Questions open a whole row at a time (both cards side by side in the two-column layout), and opening
  // another row closes the previous one. The first row starts open.
  const rowOf = (i: number) => Math.floor(i / columns);
  const [openRow, setOpenRow] = useState<number | null>(0);
  const toggle = (i: number) => setOpenRow((prev) => (prev === rowOf(i) ? null : rowOf(i)));

  // The two-column grid stretches items, so cards side by side always share the same height
  return (
    <div className={columns === 2 ? 'grid gap-3 md:grid-cols-2' : 'space-y-3'}>
      {items.map((faq, i) => {
        const isOpen = expandAll || openRow === rowOf(i);
        return (
          <div
            key={faq.q}
            className={`overflow-hidden rounded-2xl border bg-white transition-[border-color,box-shadow] duration-200 ${
              isOpen ? 'border-green-200 shadow-[0_8px_24px_-16px_rgba(22,163,74,0.4)]' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <h3>
              <button
                type="button"
                id={`${idPrefix}-q-${i}`}
                aria-expanded={isOpen}
                aria-controls={`${idPrefix}-a-${i}`}
                onClick={() => toggle(i)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left md:px-6"
              >
                <span className="flex-1 text-[15px] font-semibold text-navy-900">{faq.q}</span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition duration-300 ${
                    isOpen ? 'rotate-180 bg-green-50 text-green-600' : 'text-slate-400'
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
            </h3>
            {/* grid-rows 0fr → 1fr animates the height smoothly without measuring it */}
            <div
              id={`${idPrefix}-a-${i}`}
              role="region"
              aria-labelledby={`${idPrefix}-q-${i}`}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-sm leading-relaxed text-slate-600 md:px-6">{faq.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
