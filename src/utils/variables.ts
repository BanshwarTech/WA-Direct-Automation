// Message variables: {order_id}, {amount}, … are replaced with values entered on the Send page.
// {name} is special in bulk mode, where it comes from each recipient in the list.

const VAR_RE = /\{([a-z][a-z0-9_]*)\}/gi;

/** Unique variable names in the order they first appear (lower-cased) */
export function extractVariables(text: string): string[] {
  const seen = new Set<string>();
  for (const m of text.matchAll(VAR_RE)) seen.add(m[1].toLowerCase());
  return [...seen];
}

/** Replaces every variable that has a non-empty value; unknown or empty ones are left as {var} */
export function fillVariables(text: string, values: Record<string, string>): string {
  return text.replace(VAR_RE, (whole, key: string) => {
    const v = values[key.toLowerCase()]?.trim();
    return v ? v : whole;
  });
}

/** order_id → "Order ID" */
export function variableLabel(key: string): string {
  return key
    .split('_')
    .map((w) => (['id', 'ip', 'upi', 'no'].includes(w) ? (w === 'no' ? 'No.' : w.toUpperCase()) : w[0].toUpperCase() + w.slice(1)))
    .join(' ');
}

// Example values shown as input placeholders
export const VARIABLE_HINTS: Record<string, string> = {
  name: 'Rahul',
  order_id: 'QH-10245',
  item_1: 'Cloud VPS – 4 GB RAM',
  item_2: 'Windows RDP – 1 Month',
  item_3: 'Free SSL Certificate',
  courier: 'Delhivery',
  tracking_id: 'DL123456789IN',
  tracking_link: 'https://track.example.com/DL123',
  date: '15 Oct 2026',
  time: '4:00 PM',
  amount: '999',
  old_price: '1,499',
  new_price: '999',
  invoice_no: 'INV-2026-0042',
  invoice_link: 'https://billing.example.com/inv/42',
  due_date: '20 Oct 2026',
  upi_id: 'business@upi',
  payment_link: 'https://pay.example.com/inv42',
  transaction_id: 'TXN8839201',
  company: 'Your Company',
  login_link: 'https://client.example.com',
  service: 'Cloud VPS',
  server_ip: '192.168.1.10',
  expiry_date: '31 Oct 2026',
  renewal_link: 'https://client.example.com/renew',
  start_time: '2:00 AM',
  end_time: '4:00 AM',
  impact: 'Websites may be briefly unavailable',
  status_link: 'https://status.example.com',
  location: 'Online (Google Meet)',
  topic: 'Project kickoff',
  meeting_link: 'https://meet.google.com/xyz-abc',
  ticket_no: '58213',
  response_time: '2 hours',
  resolution: 'DNS records updated',
  review_link: 'https://g.page/r/your-business',
  discount: '30',
  product: 'all hosting plans',
  coupon: 'SAVE30',
  offer_link: 'https://example.com/offer',
  sender_name: 'Support Team',
};
