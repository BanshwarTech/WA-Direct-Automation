import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  PenLine,
  QrCode,
  Send,
} from 'lucide-react';
import { WaStatus } from '../hooks/useWaStatus';
import { FeaturesBento } from '../components/FeaturesBento';
import { Hero } from '../components/Hero';
import { HomeFaq } from '../components/HomeFaq';
import { HomeCta } from '../components/HomeCta';

interface Props {
  waStatus: WaStatus | null;
}

const STEPS = [
  { icon: QrCode, title: 'Link WhatsApp', text: 'Scan the QR code once from Linked Devices on your phone.' },
  { icon: PenLine, title: 'Write your message', text: 'Type it yourself or let the AI Composer draft it.' },
  { icon: Send, title: 'Click Send', text: 'Delivered from your own number in the background.' },
  { icon: CheckCircle2, title: 'Customer receives it', text: 'A normal WhatsApp message, with no WhatsApp Web involved.' },
];

export const HomePage: React.FC<Props> = ({ waStatus }) => {
  return (
    <div>
      <Hero waStatus={waStatus} />
      <div className="mx-auto max-w-7xl space-y-24 px-4 py-20 sm:px-6 lg:px-8">
      <FeaturesBento />

      {/* How it works */}
      <section className="relative overflow-hidden rounded-3xl bg-navy-900 p-8 md:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_100%_100%,rgba(37,211,102,0.18),transparent_70%)]"
        />
        <div className="relative space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white">How it works</h2>
            <p className="text-slate-300">From setup to a delivered message in under a minute.</p>
          </div>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="flex w-full items-center justify-center lg:justify-start">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-green-600 shadow-lg">
                    <step.icon className="h-6 w-6" />
                  </span>
                  {i < STEPS.length - 1 && (
                    <span aria-hidden className="ml-4 hidden flex-1 items-center gap-1 text-wa lg:flex">
                      <span className="h-px flex-1 border-t-2 border-dashed border-wa/60" />
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-wa">Step {i + 1}</span>
                <h3 className="mt-1 font-bold text-white">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <HomeFaq />

      <HomeCta />
      </div>
    </div>
  );
};
