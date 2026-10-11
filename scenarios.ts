// Saved AI Composer scenarios: each account can add its own message purposes next to the built-in ones.

import crypto from 'crypto';
import type { Express } from 'express';
import { getUserScenarios, requireAuth, requireJson, updateUser } from './auth';

const MAX_SCENARIOS = 30;

export function registerScenarioRoutes(app: Express) {
  app.use('/api/scenarios', requireJson, requireAuth);

  app.get('/api/scenarios', (req, res) => {
    res.json({ scenarios: getUserScenarios(req.user!.id) });
  });

  app.post('/api/scenarios', (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    const instructions = String(req.body?.instructions ?? '').trim();
    if (name.length < 2 || name.length > 50) return res.status(400).json({ error: 'Give the scenario a name (2–50 characters).', field: 'name' });
    if (instructions.length < 5 || instructions.length > 600) {
      return res.status(400).json({ error: 'Describe what the message should say (5–600 characters).', field: 'instructions' });
    }

    const result = updateUser(req.user!.id, (user) => {
      const list = user.scenarios ?? [];
      if (list.length >= MAX_SCENARIOS) return { error: `You can save up to ${MAX_SCENARIOS} scenarios.` };
      if (list.some((s) => s.name.toLowerCase() === name.toLowerCase())) return { error: 'A scenario with this name already exists.' };
      const scenario = { id: crypto.randomUUID(), name, instructions };
      user.scenarios = [...list, scenario];
      return { scenario };
    });
    if (!result) return res.status(404).json({ error: 'User not found.' });
    if ('error' in result) return res.status(409).json({ error: result.error, field: 'name' });
    res.status(201).json(result);
  });

  app.delete('/api/scenarios/:id', (req, res) => {
    updateUser(req.user!.id, (user) => {
      user.scenarios = (user.scenarios ?? []).filter((s) => s.id !== req.params.id);
    });
    res.json({ success: true });
  });
}
