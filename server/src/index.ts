import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { config, dbEnabled } from './config.js';
import { api } from './routes/api.js';
import { dbHealthy } from './db/client.js';
import { resolveConnectors } from './services/tenantConfig.js';
import { startSyslog, seedSyslogDemo } from './ingest/syslog/index.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

app.use('/api', rateLimit({ windowMs: 60_000, max: 240, standardHeaders: true, legacyHeaders: false }));
app.use('/api', api);

// Serve the built frontend (single-container production deployment).
const webDist = path.resolve(__dirname, '../../web/dist');
app.use(express.static(webDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(webDist, 'index.html'), (err) => err && next());
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err?.message || err);
  res.status(500).json({ error: 'internal_error', message: err?.message || 'erro interno' });
});

app.listen(config.port, () => {
  console.log(`\n  ╔══════════════════════════════════════════════╗`);
  console.log(`  ║   SOC Xpert · Sec4data Cyber Defense          ║`);
  console.log(`  ║   API em http://0.0.0.0:${config.port}                  ║`);
  console.log(`  ║   Modo: ${config.demoMode ? 'DEMO (dados simulados)   ' : 'LIVE (conectores reais)  '}             ║`);
  console.log(`  ╚══════════════════════════════════════════════╝\n`);
  seedSyslogDemo();
  startSyslog();
  void reportFoundationStatus();
});

/** Logs Phase-03 foundation status without ever blocking or crashing boot. */
async function reportFoundationStatus(): Promise<void> {
  try {
    if (dbEnabled) {
      const ok = await dbHealthy();
      console.log(`  · Base de dados: ${ok ? 'ligada' : 'configurada mas inacessível (modo legado)'}`);
    } else {
      console.log('  · Base de dados: não configurada (modo legado · .env)');
    }
    const conn = await resolveConnectors();
    console.log(`  · Origem dos conectores: ${conn.source === 'db' ? 'base de dados (por tenant)' : '.env (global)'}\n`);
  } catch {
    /* status is best-effort only */
  }
}
