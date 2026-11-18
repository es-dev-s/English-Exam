import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import assessmentRoutes from './routes/assessment.js';
import adminRoutes from './routes/admin.js';
import { initDb, query } from './db/database.js';
import { validateProductionEnv } from './config/env.js';
import { isAllowedCorsOrigin } from './utils/corsOrigins.js';
import { logServerUrls } from './utils/networkAddresses.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Always load server/.env (cwd may differ on Windows shortcuts / IDE runners)
dotenv.config({ path: join(__dirname, '.env') });

validateProductionEnv();

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 3010;
const HOST = process.env.HOST || '0.0.0.0';
const MAX_PORT_ATTEMPTS = 10;

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  })
);
app.use(express.json({ limit: '1mb' }));
app.get('/health', async (_req, res) => {
  try {
    const result = await query('SELECT 1 AS ok');
    res.json({
      ok: true,
      database: result.rows[0]?.ok === 1 ? 'connected' : 'unknown',
      port: DEFAULT_PORT,
      host: HOST,
    });
  } catch (err) {
    res.status(503).json({
      ok: false,
      database: 'disconnected',
      error: err.message,
    });
  }
});
app.use('/api', assessmentRoutes);
app.use('/api/admin', adminRoutes);

function listen(port, attempt = 0) {
  const server = app.listen(port, HOST, () => {
    logServerUrls(port, { label: 'Entegra Assessment Portal API' });
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not set — sales answers will use demo-mode grading.');
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
      console.warn(`Port ${port} in use, trying ${port + 1}...`);
      listen(port + 1, attempt + 1);
      return;
    }
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
}

try {
  await initDb();
  console.log('Connected to PostgreSQL and applied schema.');
  listen(DEFAULT_PORT);
} catch (err) {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
}
