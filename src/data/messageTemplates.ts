// Built-in message templates offered on the Send Messages page (next to the user's saved messages)

export interface MessageTemplate {
  id: string;
  title: string;
  emoji: string;
  /** Shown under the title in the picker */
  category: string;
  text: string;
}

// {variables} are filled in on the Send page (or per row from an Excel sheet in bulk mode)
const t = (id: string, category: string, emoji: string, title: string, lines: string[]): MessageTemplate => ({
  id: `tpl:${id}`,
  category,
  emoji,
  title,
  text: lines.join('\n'),
});

// Uses every editor format: bold, italic, strike, code, monospace, lists, quote, emoji
const showcase = [
  'Hello {name}! 👋',
  '',
  'Your order *#{order_id}* has been _confirmed_ ✅',
  '',
  '*Order summary:*',
  '- {item_1}',
  '- {item_2}',
  '- {item_3} 🎁',
  '',
  '*Next steps:*',
  '1. Check your email for login details',
  '2. Log in to the client area',
  '3. Start using your service 🚀',
  '',
  'Price: ~₹{old_price}~ *₹{new_price}* only 🔥',
  'Coupon code: `{coupon}`',
  '',
  '```Server IP: {server_ip}```',
  '',
  '> Need help? Just reply to this message 💬',
  '',
  'Thank you for choosing us! 🙏',
].join('\n');

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  { id: 'tpl:showcase', category: 'Orders', emoji: '✨', title: 'Order confirmation (all formats)', text: showcase },

  // Orders
  t('order-shipped', 'Orders', '🚚', 'Order shipped', [
    'Hello {name}! 👋',
    '',
    'Good news: your order *{order_id}* has been _shipped_ 🚚',
    '',
    '*Courier:* {courier}',
    '*Tracking ID:* `{tracking_id}`',
    '*Expected delivery:* {date}',
    '',
    'Track your parcel here: {tracking_link}',
    '',
    'Thank you for shopping with us! 🙏',
  ]),
  t('order-delivered', 'Orders', '✅', 'Order delivered', [
    'Hello {name}! 😊',
    '',
    'Your order *{order_id}* has been *delivered* ✅',
    '',
    'We hope you love it. If anything is not right, simply reply to this message and we will sort it out.',
    '',
    '> Enjoyed the experience? Your feedback helps us improve ⭐',
  ]),

  // Payments
  t('payment-reminder', 'Payments', '⏰', 'Payment reminder', [
    'Dear {name},',
    '',
    'This is a gentle reminder that invoice *{invoice_no}* for *₹{amount}* is due on *{due_date}*.',
    '',
    '*Pay using:*',
    '- UPI: `{upi_id}`',
    '- Online: {payment_link}',
    '',
    'If you have already paid, please ignore this message. 🙏',
    '',
    '_Thank you for your prompt payment._',
  ]),
  t('payment-received', 'Payments', '💰', 'Payment received', [
    'Dear {name},',
    '',
    'We have received your payment of *₹{amount}* ✅',
    '',
    '*Invoice:* {invoice_no}',
    '*Transaction ID:* `{transaction_id}`',
    '*Date:* {date}',
    '',
    'Thank you for your business! 🙏',
  ]),
  t('invoice', 'Payments', '🧾', 'Invoice generated', [
    'Dear {name},',
    '',
    'A new invoice has been generated for your account.',
    '',
    '*Invoice No.:* {invoice_no}',
    '*Amount:* ₹{amount}',
    '*Due date:* {due_date}',
    '',
    'View and pay: {invoice_link}',
    '',
    '> Questions about this invoice? Just reply here 💬',
  ]),

  // Services & accounts
  t('welcome', 'Services', '🎉', 'Welcome new customer', [
    'Welcome aboard, {name}! 🎉',
    '',
    'Thank you for choosing *{company}*. Your account is ready.',
    '',
    '*Getting started:*',
    '1. Log in at {login_link}',
    '2. Complete your profile',
    '3. Reach out to us anytime for help',
    '',
    'We are glad to have you with us! 🙌',
  ]),
  t('service-active', 'Services', '🚀', 'Service activated', [
    'Hello {name}! 👋',
    '',
    'Your *{service}* is now _active_ 🚀',
    '',
    'Your *login details* have been sent to your registered email.',
    '',
    '```Server IP: {server_ip}```',
    '',
    'Need help setting up? Reply to this message and our team will assist you. 💬',
  ]),
  t('renewal', 'Services', '🔔', 'Renewal reminder', [
    'Dear {name},',
    '',
    'Your *{service}* will expire on *{expiry_date}* ⚠️',
    '',
    'Renew now to avoid any interruption to your service:',
    '{renewal_link}',
    '',
    '_Renewal amount:_ *₹{amount}*',
    '',
    'Thank you for staying with us! 🙏',
  ]),
  t('maintenance', 'Services', '🛠️', 'Scheduled maintenance', [
    'Dear {name},',
    '',
    '🛠️ *Scheduled maintenance notice*',
    '',
    '*Date:* {date}',
    '*Time:* {start_time} – {end_time}',
    '*Expected impact:* {impact}',
    '',
    'We apologise for any inconvenience and will keep the downtime as short as possible.',
    '',
    '> Status updates: {status_link}',
  ]),

  // Appointments
  t('appointment-confirm', 'Appointments', '📅', 'Appointment confirmation', [
    'Hello {name}! 👋',
    '',
    'Your appointment is *confirmed* ✅',
    '',
    '*Date:* {date}',
    '*Time:* {time}',
    '*Location:* {location}',
    '',
    'Please reply *YES* to confirm or *RESCHEDULE* to change the time.',
  ]),
  t('appointment-reminder', 'Appointments', '⏰', 'Appointment reminder', [
    'Hello {name}! ⏰',
    '',
    'A friendly reminder of your appointment *tomorrow at {time}*.',
    '',
    '*Location:* {location}',
    '',
    'Please arrive 10 minutes early. See you soon! 😊',
  ]),
  t('meeting', 'Appointments', '💻', 'Meeting link', [
    'Hello {name}! 👋',
    '',
    'Here are the details for our meeting:',
    '',
    '*Topic:* {topic}',
    '*Date & time:* {date}, {time}',
    '*Join link:* {meeting_link}',
    '',
    'Looking forward to speaking with you. 🤝',
  ]),

  // Support
  t('ticket-received', 'Support', '🎫', 'Support ticket received', [
    'Hello {name}! 👋',
    '',
    'We have received your request. Your ticket number is *#{ticket_no}*',
    '',
    'Our team will get back to you within *{response_time}*.',
    '',
    '_Please keep this number for future reference._',
  ]),
  t('issue-resolved', 'Support', '✅', 'Issue resolved', [
    'Hello {name}! 😊',
    '',
    'Your ticket *#{ticket_no}* has been *resolved* ✅',
    '',
    '*Resolution:* {resolution}',
    '',
    'If the issue comes back, just reply to this message and we will reopen the ticket.',
  ]),
  t('feedback', 'Support', '⭐', 'Feedback request', [
    'Hello {name}! 🙏',
    '',
    'Thank you for choosing *{company}*. How was your experience?',
    '',
    'Please rate us from *1 to 5* ⭐ by replying to this message, or leave a review here:',
    '{review_link}',
    '',
    '_It takes less than a minute and helps us a lot._',
  ]),

  // Marketing
  t('offer', 'Marketing', '🔥', 'Special offer', [
    '🎉 *Special offer for you!* 🎉',
    '',
    'Get *{discount}% OFF* on {product} 🔥',
    '',
    'Price: ~₹{old_price}~ *₹{new_price}*',
    'Coupon code: `{coupon}`',
    '',
    '⏳ _Valid till {date} only._',
    '',
    'Grab it now: {offer_link}',
  ]),
  t('thank-you', 'Marketing', '🙏', 'Thank you message', [
    'Dear {name},',
    '',
    'Thank you for being a valued part of *{company}* 🙏',
    '',
    'Your trust means a lot to us. If there is anything we can do better, we would love to hear from you. 💬',
    '',
    '_Warm regards,_',
    '*{sender_name}*',
  ]),

  // General
  t('test', 'General', '📝', 'Test message', ['Hello! This is a test message sent without a Meta account. ✅']),
];

export const DEFAULT_MESSAGE = showcase;
