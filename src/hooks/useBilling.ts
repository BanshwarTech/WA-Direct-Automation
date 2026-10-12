import { useCallback, useEffect, useState } from 'react';
import type { Plan, PlanFeatures, PlanId } from '../data/plans';

export interface BillingInfo {
  plans: Plan[];
  usage: {
    planId: PlanId;
    planName: string;
    source?: 'prepaid' | 'subscription';
    limit: number;
    used: number;
    /** null = unlimited (admin) */
    remaining: number | null;
    periodEnd: string;
    unlimited: boolean;
    features: PlanFeatures;
    subscription?: { id: string; planId: 'basic' | 'pro'; status: string };
  };
  payments: { id: string; planId: 'basic' | 'pro'; amount: number; kind: 'prepaid' | 'subscription'; at: string }[];
  payments_enabled: boolean;
  key_id: string | null;
  test_mode: boolean;
}

const jsonHeaders = { 'Content-Type': 'application/json' };

async function post<T = any>(url: string, body: unknown = {}): Promise<T> {
  const res = await fetch(url, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Razorpay Checkout is loaded on demand, only when someone pays
let checkoutScript: Promise<void> | null = null;
function loadCheckout(): Promise<void> {
  if ((window as any).Razorpay) return Promise.resolve();
  checkoutScript ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => {
      checkoutScript = null;
      reject(new Error('Could not load Razorpay. Check your internet connection and try again.'));
    };
    document.body.appendChild(s);
  });
  return checkoutScript;
}

interface CheckoutOptions {
  keyId: string;
  orderId?: string;
  subscriptionId?: string;
  amount?: number;
  description: string;
  prefill: { name: string; email: string; contact: string };
}

/** Opens Razorpay Checkout; resolves with the payment response, rejects if the user closes it or it fails */
async function openCheckout(opts: CheckoutOptions): Promise<Record<string, string>> {
  await loadCheckout();
  return new Promise((resolve, reject) => {
    const rzp = new (window as any).Razorpay({
      key: opts.keyId,
      ...(opts.orderId ? { order_id: opts.orderId, amount: opts.amount, currency: 'INR' } : { subscription_id: opts.subscriptionId }),
      name: 'WA Direct Automation',
      description: opts.description,
      prefill: opts.prefill,
      theme: { color: '#16a34a' },
      handler: (response: Record<string, string>) => resolve(response),
      modal: { ondismiss: () => reject(new Error('Payment cancelled.')) },
    });
    rzp.on('payment.failed', (r: any) => reject(new Error(r?.error?.description || 'Payment failed. Please try again.')));
    rzp.open();
  });
}

// The logged-in user's plan, usage and payments, plus actions to buy, subscribe and cancel
export function useBilling(enabled: boolean) {
  const [info, setInfo] = useState<BillingInfo | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return setInfo(null);
    const res = await fetch('/api/billing').catch(() => null);
    if (res?.ok) setInfo(await res.json());
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** mode "once" = 30-day pack, "autopay" = monthly Razorpay subscription */
  const buy = useCallback(
    async (planId: 'basic' | 'pro', mode: 'once' | 'autopay', prefill: CheckoutOptions['prefill'], description: string) => {
      if (mode === 'once') {
        const order = await post<{ orderId: string; amount: number; keyId: string }>('/api/billing/order', { planId });
        const response = await openCheckout({ keyId: order.keyId, orderId: order.orderId, amount: order.amount, description, prefill });
        await post('/api/billing/order/verify', response);
      } else {
        const sub = await post<{ subscriptionId: string; keyId: string }>('/api/billing/subscription', { planId });
        const response = await openCheckout({ keyId: sub.keyId, subscriptionId: sub.subscriptionId, description, prefill });
        await post('/api/billing/subscription/verify', response);
      }
      await refresh();
    },
    [refresh]
  );

  const cancelAutopay = useCallback(async () => {
    await post('/api/billing/subscription/cancel');
    await refresh();
  }, [refresh]);

  return { info, refresh, buy, cancelAutopay };
}
