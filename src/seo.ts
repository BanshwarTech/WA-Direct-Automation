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
  login: {
    title: 'Log in | WA Direct Automation',
    description: 'Log in to WA Direct Automation to send WhatsApp messages from your own linked number.',
  },
  register: {
    title: 'Create your free account | WA Direct Automation',
    description:
      'Create a free WA Direct Automation account, link your own WhatsApp with a QR code, and start sending messages in about a minute.',
  },
  help: {
    title: 'Help Center | WA Direct Automation',
    description:
      'Troubleshooting, anti-ban guidelines, and answers to common questions about sending WhatsApp messages with WA Direct Automation.',
  },
};
