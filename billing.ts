// Message plans and Razorpay payments.
//
// Every account has a 30-day usage period. Free accounts get PLANS.free messages per period; buying a plan
// starts a fresh 30-day period with that plan's limit. Two ways to pay:
//   - prepaid:      a one-time Razorpay order, 30 days of the plan
//   - subscription: Razorpay autopay; every monthly charge (webhook subscription.charged) starts a new period
// Payments are activated only after the Razorpay signature is verified on the server, and each payment id is
// processed once (client verification and the webhook can both arrive).
// The owner (admin) account is never limited.

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { Express, Request, Response } from 'express';
import { Billing, findUserIdByBilling, getUserBilling, PublicUser, requireAuth, requireJson, updateUser } from './auth';
import { ALL_FEATURES, PLAN_DAYS, PLANS, planById, PlanFeature, PlanFeatures, PlanId } from './src/data/plans';

const DAY = 24 * 60 * 60 * 1000;
const RZP_API = 'https://api.razorpay.com/v1';
const PLAN_CACHE_FILE = path.join(path.resolve(process.env.DATA_DIR || './data'), 'razorpay-plans.json');

const keyId = () => process.env.RAZORPAY_KEY_ID?.trim() || '';
const keySecret = () => process.env.RAZORPAY_KEY_SECRET?.trim() || '';
const webhookSecret = () => process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || '';
export const paymentsConfigured = () => Boolean(keyId() && keySecret());

type PaidPlanId = Exclude<PlanId, 'free'>;
const isPaidPlan = (id: unknown): id is PaidPlanId => id === 'basic' || id === 'pro';

// ---------- usage ----------

const newPeriod = (planId: PlanId, source?: Billing['source']): Pick<Billing, 'planId' | 'source' | 'periodStart' | 'periodEnd' | 'used'> => {
  const now = Date.now();
  return { planId, source, periodStart: new Date(now).toISOString(), periodEnd: new Date(now + PLAN_DAYS * DAY).toISOString(), used: 0 };
};

/** Rolls an expired period over: a finished paid period falls back to Free with a fresh allowance */
function current(billing: Billing | undefined): Billing {
  if (!billing) return newPeriod('free') as Billing;
  if (Date.now() < new Date(billing.periodEnd).getTime()) return billing;
  return { ...billing, ...newPeriod('free') };
}

export interface Usage {
  planId: PlanId;
  planName: string;
  source?: Billing['source'];
  limit: number;
  used: number;
  remaining: number;
  periodEnd: string;
  unlimited: boolean;
  /** Plan features currently switched on (all for the admin) */
  features: PlanFeatures;
  subscription?: Billing['subscription'];
}

export function getUsage(user: PublicUser): Usage {
  const b = current(getUserBilling(user.id));
  const plan = planById(b.planId);
  const unlimited = user.role === 'owner';
  return {
    planId: plan.id,
    planName: unlimited ? 'Admin' : plan.name,
    source: b.source,
    limit: plan.messages,
    used: b.used,
    remaining: unlimited ? Number.POSITIVE_INFINITY : Math.max(0, plan.messages - b.used),
    periodEnd: b.periodEnd,
    unlimited,
    features: unlimited ? ALL_FEATURES : plan.allows,
    subscription: b.subscription,
  };
}

/** Whether the user's current plan includes a feature (the admin has every feature) */
export const planAllows = (user: PublicUser, feature: PlanFeature) => getUsage(user).features[feature];

/** Counts one successful message against the user's current period */
export function recordMessageSent(userId: string) {
  updateUser(userId, (user) => {
    const b = current(user.billing);
    user.billing = { ...b, used: b.used + 1 };
  });
}

/** Starts a paid period for a verified payment (no-op if this payment was already processed) */
function activatePlan(userId: string, planId: PaidPlanId, payment: { id: string; amount: number; kind: 'prepaid' | 'subscription' }) {
  return updateUser(userId, (user) => {
    const b = current(user.billing);
    if (b.payments?.some((p) => p.id === payment.id)) return false;
    user.billing = {
      ...b,
      ...newPeriod(planId, payment.kind),
      payments: [{ ...payment, planId, at: new Date().toISOString() }, ...(b.payments ?? [])].slice(0, 50),
    };
    return true;
  });
}

// ---------- Razorpay ----------

async function rzp<T = any>(pathname: string, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`${RZP_API}${pathname}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId()}:${keySecret()}`).toString('base64')}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.description || `Razorpay request failed (${res.status})`);
  return data;
}

const hmac = (payload: string | Buffer, secret: string) => crypto.createHmac('sha256', secret).update(payload).digest('hex');

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// Razorpay plan ids for autopay, created on first use and cached per plan + price
function loadPlanCache(): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(PLAN_CACHE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

async function razorpayPlanId(planId: PaidPlanId): Promise<string> {
  const plan = planById(planId);
  const cacheKey = `${keyId()}:${plan.id}:${plan.price}`;
  const cache = loadPlanCache();
  if (cache[cacheKey]) return cache[cacheKey];
  const created = await rzp<{ id: string }>('/plans', 'POST', {
    period: 'monthly',
    interval: 1,
    item: { name: `${plan.name} plan`, amount: plan.price * 100, currency: 'INR', description: `${plan.messages} WhatsApp messages / month` },
  });
  fs.mkdirSync(path.dirname(PLAN_CACHE_FILE), { recursive: true });
  fs.writeFileSync(PLAN_CACHE_FILE, JSON.stringify({ ...cache, [cacheKey]: created.id }, null, 2));
  return created.id;
}

const notConfigured = (res: Response) =>
  res.status(503).json({ error: 'Online payments are not set up yet. Please contact the administrator.' });

// ---------- routes ----------

export function registerBillingRoutes(app: Express) {
  // Razorpay webhook: no session, authenticated by its HMAC signature over the raw body
  app.post('/api/billing/webhook', (req: Request & { rawBody?: Buffer }, res: Response) => {
    const signature = req.get('x-razorpay-signature') || '';
    if (!webhookSecret() || !req.rawBody || !safeEqual(hmac(req.rawBody, webhookSecret()), signature)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    handleWebhook(req.body).catch((e) => console.error('Razorpay webhook error:', e?.message));
    res.json({ ok: true });
  });

  app.use('/api/billing', requireJson, requireAuth);

  app.get('/api/billing', (req, res) => {
    const usage = getUsage(req.user!);
    const b = getUserBilling(req.user!.id);
    res.json({
      plans: PLANS,
      usage: { ...usage, remaining: usage.unlimited ? null : usage.remaining },
      payments: (b?.payments ?? []).slice(0, 10),
      payments_enabled: paymentsConfigured(),
      key_id: keyId() || null,
      test_mode: keyId().startsWith('rzp_test_'),
    });
  });

  // Pay once: create an order for 30 days of the plan
  app.post('/api/billing/order', async (req, res) => {
    if (!paymentsConfigured()) return notConfigured(res);
    const planId = req.body?.planId;
    if (!isPaidPlan(planId)) return res.status(400).json({ error: 'Choose a paid plan.' });
    const plan = planById(planId);
    try {
      const order = await rzp<{ id: string; amount: number }>('/orders', 'POST', {
        amount: plan.price * 100,
        currency: 'INR',
        receipt: `${planId}-${Date.now()}`,
        notes: { userId: req.user!.id, planId },
      });
      res.json({ orderId: order.id, amount: order.amount, keyId: keyId() });
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });

  app.post('/api/billing/order/verify', async (req, res) => {
    if (!paymentsConfigured()) return notConfigured(res);
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body ?? {};
    if (!orderId || !paymentId || !signature || !safeEqual(hmac(`${orderId}|${paymentId}`, keySecret()), String(signature))) {
      return res.status(400).json({ error: 'Payment verification failed. If money was deducted, it will be refunded automatically.' });
    }
    try {
      // The order (created by us) says which user and plan this payment is for
      const order = await rzp<{ amount: number; notes: { userId?: string; planId?: string } }>(`/orders/${orderId}`);
      if (order.notes?.userId !== req.user!.id || !isPaidPlan(order.notes?.planId)) {
        return res.status(400).json({ error: 'This payment does not belong to your account.' });
      }
      activatePlan(req.user!.id, order.notes.planId, { id: String(paymentId), amount: order.amount / 100, kind: 'prepaid' });
      res.json({ success: true, usage: getUsage(req.user!) });
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });

  // Autopay: create a monthly Razorpay subscription
  app.post('/api/billing/subscription', async (req, res) => {
    if (!paymentsConfigured()) return notConfigured(res);
    const planId = req.body?.planId;
    if (!isPaidPlan(planId)) return res.status(400).json({ error: 'Choose a paid plan.' });
    const existing = getUserBilling(req.user!.id)?.subscription;
    if (existing && ['active', 'authenticated'].includes(existing.status)) {
      return res.status(409).json({ error: 'You already have an active autopay subscription. Cancel it first to switch plans.' });
    }
    try {
      const sub = await rzp<{ id: string; status: string }>('/subscriptions', 'POST', {
        plan_id: await razorpayPlanId(planId),
        total_count: 60,
        customer_notify: 1,
        notes: { userId: req.user!.id, planId },
      });
      updateUser(req.user!.id, (user) => {
        user.billing = { ...current(user.billing), subscription: { id: sub.id, planId, status: sub.status } };
      });
      res.json({ subscriptionId: sub.id, keyId: keyId() });
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });

  app.post('/api/billing/subscription/verify', async (req, res) => {
    if (!paymentsConfigured()) return notConfigured(res);
    const { razorpay_subscription_id: subId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body ?? {};
    const sub = getUserBilling(req.user!.id)?.subscription;
    if (!sub || sub.id !== subId || !paymentId || !signature || !safeEqual(hmac(`${paymentId}|${subId}`, keySecret()), String(signature))) {
      return res.status(400).json({ error: 'Payment verification failed. If money was deducted, it will be refunded automatically.' });
    }
    activatePlan(req.user!.id, sub.planId, { id: String(paymentId), amount: planById(sub.planId).price, kind: 'subscription' });
    updateUser(req.user!.id, (user) => {
      if (user.billing?.subscription) user.billing.subscription.status = 'active';
    });
    res.json({ success: true, usage: getUsage(req.user!) });
  });

  // Stops autopay at the end of the current period; the plan keeps working until then
  app.post('/api/billing/subscription/cancel', async (req, res) => {
    if (!paymentsConfigured()) return notConfigured(res);
    const sub = getUserBilling(req.user!.id)?.subscription;
    if (!sub || !['active', 'authenticated', 'created'].includes(sub.status)) return res.status(400).json({ error: 'No active autopay to cancel.' });
    try {
      await rzp(`/subscriptions/${sub.id}/cancel`, 'POST', { cancel_at_cycle_end: sub.status === 'active' ? 1 : 0 });
      updateUser(req.user!.id, (user) => {
        if (user.billing?.subscription) user.billing.subscription.status = 'cancelled';
      });
      res.json({ success: true, usage: getUsage(req.user!) });
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });
}

async function handleWebhook(body: any) {
  const event: string = body?.event || '';
  const sub = body?.payload?.subscription?.entity;
  const payment = body?.payload?.payment?.entity;

  if (event.startsWith('subscription.') && sub?.id) {
    const userId = sub.notes?.userId || findUserIdByBilling((b) => b.subscription?.id === sub.id);
    const planId = sub.notes?.planId;
    if (!userId) return;
    // Every successful monthly charge starts a new 30-day period
    if (event === 'subscription.charged' && payment?.id && isPaidPlan(planId)) {
      activatePlan(userId, planId, { id: payment.id, amount: payment.amount / 100, kind: 'subscription' });
    }
    updateUser(userId, (user) => {
      const own = user.billing?.subscription;
      if (own && own.id === sub.id) own.status = sub.status;
    });
    return;
  }

  // Backup for one-time payments when the browser closed before verification
  if (event === 'payment.captured' && payment?.order_id && !payment.invoice_id) {
    const order = await rzp<{ notes: { userId?: string; planId?: string } }>(`/orders/${payment.order_id}`);
    if (order.notes?.userId && isPaidPlan(order.notes.planId)) {
      activatePlan(order.notes.userId, order.notes.planId, { id: payment.id, amount: payment.amount / 100, kind: 'prepaid' });
    }
  }
}
