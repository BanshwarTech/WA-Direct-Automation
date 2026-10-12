// Message plans, shared by the server (limits, Razorpay amounts) and the Pricing page.
// Change prices or limits here; amounts are in rupees, every plan runs for PLAN_DAYS days.

export type PlanId = 'free' | 'basic' | 'pro';

/** Features that are switched on per plan (enforced in the app and, for saved messages, on the server) */
export interface PlanFeatures {
  /** Excel / CSV upload in Bulk, with per-recipient variable columns */
  excelImport: boolean;
  /** Saving messages and keeping AI Composer output in the AI history */
  savedMessages: boolean;
}

export type PlanFeature = keyof PlanFeatures;

/** Everything on: used for the admin (owner) account */
export const ALL_FEATURES: PlanFeatures = { excelImport: true, savedMessages: true };

export interface Plan {
  id: PlanId;
  name: string;
  /** Price in rupees for one 30-day period (0 = free) */
  price: number;
  /** Successful messages allowed per period */
  messages: number;
  tagline: string;
  /** Bullet points on the Pricing page; keep them in line with `allows` */
  features: string[];
  allows: PlanFeatures;
  popular?: boolean;
}

export const PLAN_DAYS = 30;

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    messages: 50,
    tagline: 'Try it out with your own number',
    features: ['50 messages every 30 days', 'Single & bulk sending', 'Message templates', 'AI Composer'],
    allows: { excelImport: false, savedMessages: false },
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 499,
    messages: 2500,
    tagline: 'For small shops and growing teams',
    features: ['2,500 messages / 30 days', 'Excel bulk upload with variables', 'Saved messages & AI history', 'Pay once or auto-renew'],
    allows: { excelImport: true, savedMessages: true },
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 1499,
    messages: 10000,
    tagline: 'For high-volume businesses',
    features: ['10,000 messages / 30 days', 'Everything in Basic', 'Lowest cost per message', 'Pay once or auto-renew'],
    allows: { excelImport: true, savedMessages: true },
  },
];

export const planById = (id: string | undefined): Plan => PLANS.find((p) => p.id === id) ?? PLANS[0];

export const formatInr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
