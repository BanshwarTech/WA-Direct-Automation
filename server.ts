import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { adoptLegacySession, getWhatsAppStatus, logoutWhatsApp, restoreWhatsAppSessions, sendWhatsAppText } from './whatsapp';
import { registerScenarioRoutes } from './scenarios';
import { registerMessageRoutes } from './messages';
import { attachUser, registerAuthRoutes, registrationOpen, requireAuth, requireJson, PublicUser } from './auth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

app.use(express.json({ limit: '100kb' }));

// Accounts: every request is tagged with the logged-in user (session cookie or API key).
// WhatsApp and AI endpoints require an account; each account uses its own WhatsApp session.
app.use(attachUser);
registerAuthRoutes(app, {
  onRegister: async (user, isFirst) => {
    if (isFirst) await adoptLegacySession(user.id);
  },
});
app.use(['/api/wa', '/api/nvidia'], requireJson, requireAuth);
registerScenarioRoutes(app);
registerMessageRoutes(app);

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';

// Supported NVIDIA NIM models (verified working Oct 2026; Llama 3.3 70B was retired on 2026-08-26)
const DEFAULT_MODEL = 'nvidia/nemotron-3-super-120b-a12b';
const POPULAR_MODELS = [
  {
    id: DEFAULT_MODEL,
    name: 'Nemotron 3 Super 120B',
    provider: 'NVIDIA',
    description: 'Fast, high-quality responses. Best default for WhatsApp messages and auto-replies.',
    recommended: true
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b',
    name: 'Nemotron 3 Ultra 550B',
    provider: 'NVIDIA',
    description: 'Most capable and detailed output, with slower responses.',
    recommended: false
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    provider: 'OpenAI on NVIDIA NIM',
    description: 'Lightweight open-weight model for quick, casual replies.',
    recommended: false
  }
];
const MODEL_IDS = new Set(POPULAR_MODELS.map((m) => m.id));

// Shared formatting rules: WhatsApp uses single asterisks for bold, and "Hinglish" must stay in Roman script
const WHATSAPP_FORMAT_RULES = `- Use WhatsApp formatting only: *single asterisks* for bold, _underscores_ for italics. Never use Markdown such as **double asterisks** or # headings.
- If the language is Hinglish, write Hindi words in Roman (Latin) script mixed naturally with English, e.g. "Namaste Rahul ji, aapka payment pending hai."
- Output only the final message text, with no preamble, explanation, or reasoning.`;

// Reasoning models sometimes inline <think> blocks; strip them so only the reply reaches WhatsApp
const cleanReply = (text: string) => text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

// Status endpoint
app.get('/api/nvidia/status', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY.trim().length > 5);
  res.json({
    configured: hasKey,
    models: POPULAR_MODELS
  });
});

// Models list endpoint
app.get('/api/nvidia/models', (_req: Request, res: Response) => {
  res.json({
    models: POPULAR_MODELS
  });
});

// Chat completion endpoint via NVIDIA NIM
app.post('/api/nvidia/chat', async (req: Request, res: Response) => {
  const apiKey = process.env.NVIDIA_API_KEY?.trim();

  const {
    messages,
    prompt,
    model: requestedModel,
    systemPrompt = `You are an intelligent, helpful WhatsApp AI assistant for customer communication. Keep replies concise, polite, natural, and in the same language the customer writes in.\n${WHATSAPP_FORMAT_RULES}`
  } = req.body;
  const model = MODEL_IDS.has(requestedModel) ? requestedModel : DEFAULT_MODEL;

  if (!apiKey) {
    return res.status(400).json({
      error: 'NVIDIA_API_KEY is not configured on the server. Please set NVIDIA_API_KEY in your .env or environment settings.',
      isMissingKey: true
    });
  }

  // Format messages payload
  const formattedMessages = messages && Array.isArray(messages)
    ? messages
    : [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt || 'Hello' }
      ];

  // If system prompt is specified and not in array, prepend it
  if (!formattedMessages.some((m: { role: string }) => m.role === 'system')) {
    formattedMessages.unshift({ role: 'system', content: systemPrompt });
  }

  try {
    const nvidiaResponse = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        temperature: 0.6,
        top_p: 0.9,
        max_tokens: 1024,
        stream: false
      })
    });

    if (!nvidiaResponse.ok) {
      const errorText = await nvidiaResponse.text();
      return res.status(nvidiaResponse.status).json({
        error: `NVIDIA API Error (${nvidiaResponse.status}): ${errorText}`
      });
    }

    const data = await nvidiaResponse.json();
    const replyText = cleanReply(data?.choices?.[0]?.message?.content || '');

    return res.json({
      success: true,
      model: model,
      reply: replyText,
      usage: data?.usage
    });
  } catch (error: any) {
    console.error('NVIDIA Proxy error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to communicate with NVIDIA NIM API'
    });
  }
});

// WhatsApp Message Generator endpoint (Specialized for composing WhatsApp messages)
app.post('/api/nvidia/compose', async (req: Request, res: Response) => {
  const apiKey = process.env.NVIDIA_API_KEY?.trim();
  const { intent, recipientName, context, language = 'Hinglish', tone = 'professional & friendly', model: requestedModel } = req.body;
  const model = MODEL_IDS.has(requestedModel) ? requestedModel : DEFAULT_MODEL;

  if (!apiKey) {
    return res.status(400).json({
      error: 'NVIDIA_API_KEY is not configured on the server. Please set NVIDIA_API_KEY in your .env.',
      isMissingKey: true
    });
  }

  const systemPrompt = `You are an expert WhatsApp message copywriter. Write a clean, high-conversion WhatsApp message tailored for Indian & global audiences.
Language preference: ${language}.
Tone: ${tone}.
Format rules:
- Emojis naturally placed, short paragraphs.
- Direct and engaging, without fluff.
- Ready to send directly over WhatsApp.
${WHATSAPP_FORMAT_RULES}`;

  const userPrompt = `Generate a WhatsApp message for:
Recipient: ${recipientName || 'Customer'}
Purpose/Intent: ${intent}
Additional Context/Details: ${context || 'None'}`;

  try {
    const nvidiaResponse = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!nvidiaResponse.ok) {
      const errorText = await nvidiaResponse.text();
      return res.status(nvidiaResponse.status).json({
        error: `NVIDIA API Error: ${errorText}`
      });
    }

    const data = await nvidiaResponse.json();
    const messageContent = cleanReply(data?.choices?.[0]?.message?.content || '');

    return res.json({
      success: true,
      generatedMessage: messageContent
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Failed to generate message with NVIDIA AI'
    });
  }
});

// SEO: sitemap.xml and robots.txt. Absolute URLs use APP_URL when it is a real URL, otherwise the request host.
// Only public pages: /send and /ai require an account, /scripts is admin-only
const SITE_PAGES = [
  { path: '/', priority: '1.0' },
  { path: '/help', priority: '0.6' },
  { path: '/register', priority: '0.5' },
  { path: '/login', priority: '0.4' },
];

function siteOrigin(req: Request): string {
  const configured = process.env.APP_URL?.trim();
  if (configured && /^https?:\/\/[^\s]+$/i.test(configured)) return configured.replace(/\/+$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const origin = siteOrigin(req);
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = SITE_PAGES.map(
    (p) => `  <url>\n    <loc>${origin}${p.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${p.priority}</priority>\n  </url>`
  ).join('\n');
  res
    .type('application/xml')
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
});

app.get('/robots.txt', (req: Request, res: Response) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /scripts\n\nSitemap: ${siteOrigin(req)}/sitemap.xml\n`);
});

// WhatsApp direct send (Baileys, no WhatsApp Web)
app.get('/api/wa/status', (req: Request, res: Response) => {
  res.json(getWhatsAppStatus(req.user!.id));
});

app.post('/api/wa/send', async (req: Request, res: Response) => {
  const { phone, message } = req.body ?? {};
  if (!phone || !message || !String(message).trim()) {
    return res.status(400).json({ error: 'phone and message are required' });
  }

  try {
    const result = await sendWhatsAppText(req.user!.id, String(phone), String(message));
    return res.json({ success: true, ...result });
  } catch (error: any) {
    return res.status(error?.status || 500).json({ error: error?.message || 'Failed to send message' });
  }
});

app.post('/api/wa/logout', async (req: Request, res: Response) => {
  await logoutWhatsApp(req.user!.id);
  res.json({ success: true });
});

// Server-side rendering: every page request gets fully rendered HTML (visible in view-source and to crawlers),
// which React then hydrates in the browser.
type RenderFn = (
  url: string,
  origin: string,
  auth: { user: PublicUser | null; registrationOpen: boolean }
) => { html: string; head: string; status: number };

async function startServer() {
  let getPage: (url: string) => Promise<{ template: string; render: RenderFn }>;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    getPage = async (url) => {
      const raw = await fs.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
      // Load the stylesheet up front in dev so the server-rendered HTML is styled before JS runs
      const template = (await vite.transformIndexHtml(url, raw)).replace(
        '<!--app-head-->',
        '<link rel="stylesheet" href="/src/index.css" />\n    <!--app-head-->'
      );
      const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
      return { template, render };
    };
    app.use(async (req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
      try {
        await sendPage(req, res, await getPage(req.originalUrl));
      } catch (error: any) {
        vite.ssrFixStacktrace(error);
        next(error);
      }
    });
  } else {
    const clientDir = path.resolve(__dirname, 'dist/client');
    const template = await fs.readFile(path.join(clientDir, 'index.html'), 'utf-8');
    // @ts-ignore: built by `npm run build`
    const { render } = await import('./dist/server/entry-server.js');
    getPage = async () => ({ template, render });
    app.use(express.static(clientDir, { index: false }));
    app.get('*', async (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api/')) return next();
      try {
        await sendPage(req, res, await getPage(req.originalUrl));
      } catch (error) {
        next(error);
      }
    });
  }

  // Localhost only by default: /api/wa/send can message from your number, so don't expose it to the network
  app.listen(PORT, process.env.HOST || '127.0.0.1', () => {
    console.log(`🚀 WA Direct + NVIDIA NIM Server running on http://localhost:${PORT}`);
    restoreWhatsAppSessions();
  });
}

const PROTECTED_PATHS = ['/send', '/ai'];
// Admin-only pages: members are sent to Send Messages, logged-out visitors to log-in
const ADMIN_PATHS = ['/scripts'];
const AUTH_PATHS = ['/login', '/register'];

// Only same-site relative paths are accepted as a post-login destination (no open redirects)
function safeNext(value: unknown): string {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/api/') ? next : '/send';
}

async function sendPage(req: Request, res: Response, page: { template: string; render: RenderFn }) {
  // Sending requires an account: new visitors land on sign-up (or log-in when sign-up is closed)
  if (ADMIN_PATHS.includes(req.path) && req.user && req.user.role !== 'owner') {
    return res.redirect(302, '/send');
  }
  if ((PROTECTED_PATHS.includes(req.path) || ADMIN_PATHS.includes(req.path)) && !req.user) {
    const target = registrationOpen() ? '/register' : '/login';
    return res.redirect(302, `${target}?next=${encodeURIComponent(req.originalUrl)}`);
  }
  if (AUTH_PATHS.includes(req.path) && req.user) {
    return res.redirect(302, safeNext(req.query.next));
  }
  const { html, head, status } = page.render(req.originalUrl, siteOrigin(req), {
    user: req.user ?? null,
    registrationOpen: registrationOpen(),
  });
  const body = page.template.replace('<!--app-head-->', head).replace('<!--app-html-->', html);
  res.status(status).type('html').send(body);
}

startServer();
