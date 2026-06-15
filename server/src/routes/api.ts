import { Router } from 'express';
import { config } from '../config.js';
import {
  getEvents, getIncidents, getIntegrations, getDashboard, enrichIoc,
} from '../services/aggregator.js';
import { copilotChat } from '../services/copilot.js';
import { thehiveCreateCase } from '../connectors/thehive.js';
import { syslogStats } from '../ingest/syslog/index.js';
import * as mock from '../mock/data.js';

export const api = Router();

api.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'soc-xpert', mode: config.demoMode ? 'demo' : 'live', ts: new Date().toISOString() });
});

api.get('/dashboard', async (_req, res, next) => {
  try { res.json(await getDashboard()); } catch (e) { next(e); }
});

api.get('/events', async (req, res, next) => {
  try {
    const { data, live } = await getEvents();
    const sev = String(req.query.severity || 'all');
    const filtered = sev === 'all' ? data : data.filter((e) => e.severity === sev);
    res.json({ data: filtered, live });
  } catch (e) { next(e); }
});

api.get('/incidents', async (_req, res, next) => {
  try { res.json(await getIncidents()); } catch (e) { next(e); }
});

api.post('/incidents', async (req, res, next) => {
  try {
    const { title, description, severity } = req.body || {};
    const id = await thehiveCreateCase(title || 'Novo incidente', description || '', severity || 2);
    res.json({ created: true, id: id || `INC-2026-${Math.floor(Math.random() * 9000 + 1000)}`, live: Boolean(id) });
  } catch (e) { next(e); }
});

api.get('/integrations', async (_req, res, next) => {
  try { res.json({ data: await getIntegrations(), mode: config.demoMode ? 'demo' : 'live' }); } catch (e) { next(e); }
});

api.get('/syslog/stats', (_req, res) => {
  res.json(syslogStats());
});

api.get('/hunting/saved', (_req, res) => res.json({ data: mock.savedHunts }));

api.post('/hunting/run', async (_req, res) => {
  // Simulated hunt execution against the unified data lake.
  await new Promise((r) => setTimeout(r, 600));
  res.json({
    elapsed: '2.4s',
    scanned: 1_180_000,
    hits: [
      { host: 'FIN-WS-014', rdp: '14:33:10', lsass: '14:28:47', delta: '4m 23s', severity: 'crit' },
      { host: 'IT-WS-002', rdp: '14:31:02', lsass: '14:34:50', delta: '3m 48s', severity: 'high' },
      { host: 'HR-WS-009', rdp: '13:58:14', lsass: '14:01:33', delta: '3m 19s', severity: 'high' },
    ],
  });
});

api.get('/response/actions', (_req, res) => res.json({ data: mock.responseActions }));

api.post('/response/run', (req, res) => {
  const { playbook, target } = req.body || {};
  res.json({ started: true, playbook, target, ticket: `RSP-${Date.now().toString().slice(-6)}` });
});

api.get('/intel/:ioc', async (req, res, next) => {
  try { res.json(await enrichIoc(req.params.ioc)); } catch (e) { next(e); }
});

api.post('/copilot', async (req, res, next) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    res.json(await copilotChat(messages));
  } catch (e) { next(e); }
});
