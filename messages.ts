// Saved messages: each account keeps a library of reusable messages that can be picked on the Send Messages page.
// Every AI Composer generation lands in an auto-trimmed "AI history"; messages the user saves (pin) are kept.

import crypto from 'crypto';
import type { Express } from 'express';
import { getUserMessages, requireAuth, requireJson, updateUser, SavedMessage } from './auth';
import { planAllows } from './billing';

const MAX_SAVED = 50;
const MAX_AI_HISTORY = 20;

// Records from before AI history existed have no flag; they were all saved explicitly
const isPinned = (m: SavedMessage) => m.pinned !== false;

export function registerMessageRoutes(app: Express) {
  app.use('/api/messages', requireJson, requireAuth);

  app.get('/api/messages', (req, res) => {
    res.json({ messages: getUserMessages(req.user!.id) });
  });

  // Body: { text, source: 'ai' | 'manual', title?, pin? }. pin=false only applies to AI history entries.
  app.post('/api/messages', (req, res) => {
    // Saved messages and the AI history are a Basic / Pro feature
    if (!planAllows(req.user!, 'savedMessages')) {
      return res.status(402).json({ error: 'Saving messages is available on the Basic and Pro plans.', upgrade: true });
    }
    const text = String(req.body?.text ?? '').trim();
    const source = req.body?.source === 'ai' ? 'ai' : 'manual';
    const pin = source === 'manual' || req.body?.pin !== false;
    // Default title: the first line of the message without WhatsApp markers
    const title = (String(req.body?.title ?? '').trim() || text.split('\n')[0].replace(/[*_~`>]/g, '').trim()).slice(0, 60);
    if (!text || text.length > 4000) return res.status(400).json({ error: 'The message must be 1–4000 characters.' });

    const result = updateUser(req.user!.id, (user) => {
      const list = user.savedMessages ?? [];
      const existing = list.find((m) => m.text === text);
      const savedCount = list.filter(isPinned).length;

      if (existing) {
        // Saving a history entry promotes it to a kept message (and moves it to the top)
        if (pin && !isPinned(existing)) {
          if (savedCount >= MAX_SAVED) return { error: `You can save up to ${MAX_SAVED} messages. Delete one first.` };
          existing.pinned = true;
          if (req.body?.title) existing.title = title || existing.title;
        }
        user.savedMessages = [existing, ...list.filter((m) => m !== existing)];
        return { message: existing };
      }

      if (pin && savedCount >= MAX_SAVED) return { error: `You can save up to ${MAX_SAVED} messages. Delete one first.` };
      const message: SavedMessage = { id: crypto.randomUUID(), title: title || 'Untitled message', text, source, pinned: pin, createdAt: new Date().toISOString() };

      // Keep only the newest AI history entries (list is newest-first)
      let history = 0;
      user.savedMessages = [message, ...list].filter((m) => isPinned(m) || ++history <= MAX_AI_HISTORY);
      return { message };
    });
    if (!result) return res.status(404).json({ error: 'User not found.' });
    if ('error' in result) return res.status(409).json({ error: result.error });
    // The full list is returned so the client picks up promotions and trimmed history in one go
    res.status(201).json({ ...result, messages: getUserMessages(req.user!.id) });
  });

  app.delete('/api/messages/:id', (req, res) => {
    updateUser(req.user!.id, (user) => {
      user.savedMessages = (user.savedMessages ?? []).filter((m) => m.id !== req.params.id);
    });
    res.json({ success: true });
  });
}
