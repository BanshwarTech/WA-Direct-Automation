import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';

// Supported NVIDIA NIM models
const POPULAR_MODELS = [
  {
    id: 'meta/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta on NVIDIA NIM',
    description: 'State-of-the-art reasoning, excellent Hindi and English support, best for WhatsApp bots.',
    recommended: true
  },
  {
    id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    name: 'Nemotron 70B Instruct',
    provider: 'NVIDIA',
    description: 'NVIDIA optimized for human-like conversations and customer support accuracy.',
    recommended: false
  },
  {
    id: 'deepseek-ai/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek on NVIDIA NIM',
    description: 'High-power reasoning and step-by-step logic.',
    recommended: false
  },
  {
    id: 'mistralai/mixtral-8x22b-instruct',
    name: 'Mixtral 8x22B Instruct',
    provider: 'Mistral AI',
    description: 'Fast, highly efficient multilingual model.',
    recommended: false
  }
];

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
    model = 'meta/llama-3.3-70b-instruct',
    systemPrompt = 'You are an intelligent, helpful WhatsApp AI assistant for customer communication. Keep replies concise, polite, natural, and formatted cleanly for WhatsApp messages.'
  } = req.body;

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
    const replyText = data?.choices?.[0]?.message?.content || '';

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
  const { intent, recipientName, context, language = 'Hinglish', tone = 'professional & friendly' } = req.body;

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
- WhatsApp-friendly typography (*bold* for highlights, emojis naturally placed, short paragraphs).
- Direct and engaging, without fluff.
- Ready to send directly over WhatsApp.`;

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
        model: 'meta/llama-3.3-70b-instruct',
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
    const messageContent = data?.choices?.[0]?.message?.content || '';

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

// Mount Vite or serve static assets
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 WA Direct + NVIDIA NIM Server running on http://localhost:${PORT}`);
  });
}

startServer();
