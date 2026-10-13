import type { Route } from './hooks/useRoute';

// Per-page <title> and meta description, shared by the server renderer and the client
export const PAGE_META: Record<Route, { title: string; description: string }> = {
  home: {
    title: 'WA Direct Automation | Send WhatsApp Messages Without a Meta Account',
    description:
      'Send single or bulk WhatsApp messages directly from your computer. No Meta Business account, no per-message fees, no WhatsApp Web. AI message writing included.',
  },
  send: {
    title: 'Send Messages | WA Direct Automation',
    description:
      'Send WhatsApp messages to one number or a whole list from your linked WhatsApp, in the background, without opening WhatsApp Web.',
  },
  ai: {
    title: 'AI Composer | WA Direct Automation',
    description:
      'Draft ready-to-send WhatsApp messages in English, Hindi, or Hinglish with NVIDIA NIM AI models, and preview automatic customer replies.',
  },
  scripts: {
    title: 'Scripts | WA Direct Automation',
    description:
      'Download ready-made WhatsApp automation scripts: an AI auto-reply bot, Android ADB, Python, Termux, and cURL, with no Meta account.',
  },
  settings: {
    title: 'Settings | WA Direct Automation',
    description: 'Admin settings: AI and payment keys, site address and sign-up.',
  },
  login: {
    title: 'Log in | WA Direct Automation',
    description: 'Log in to WA Direct Automation to send WhatsApp messages from your own linked number.',
  },
  register: {
    title: 'Create your free account | WA Direct Automation',
    description:
      'Create a free WA Direct Automation account, link your own WhatsApp with a QR code, and start sending messages in about a minute.',
  },
  'forgot-password': {
    title: 'Forgot password | WA Direct Automation',
    description: 'Get a link by email to reset your WA Direct Automation password.',
  },
  'reset-password': {
    title: 'Choose a new password | WA Direct Automation',
    description: 'Set a new password for your WA Direct Automation account.',
  },
  'verify-email': {
    title: 'Verify your email | WA Direct Automation',
    description: 'Confirm your email address to activate your WA Direct Automation account.',
  },
  users: {
    title: 'Users & payments | WA Direct Automation',
    description: 'Admin overview of accounts, plans, usage and payments.',
  },
  pricing: {
    title: 'Pricing | WA Direct Automation',
    description:
      'Simple WhatsApp messaging plans: start free with 50 messages, or choose Basic or Pro. Pay once for 30 days or turn on monthly autopay with Razorpay.',
  },
  help: {
    title: 'Help Center | WA Direct Automation',
    description:
      'Troubleshooting, anti-ban guidelines, and answers to common questions about sending WhatsApp messages with WA Direct Automation.',
  },
};
