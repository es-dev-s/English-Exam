import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import assessmentRoutes from './routes/assessment.js';
import adminRoutes from './routes/admin.js';
import { getDb } from './db/database.js';
import { validateProductionEnv } from './config/env.js';

validateProductionEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 3010;
const MAX_PORT_ATTEMPTS = 10;

getDb();

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
      } else if (process.env.CLIENT_ORIGIN && origin === process.env.CLIENT_ORIGIN) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  })
);
app.use(express.json({ limit: '1mb' }));
app.use('/api', assessmentRoutes);
app.use('/api/admin', adminRoutes);

const clientDist = join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

function listen(port, attempt = 0) {
  const server = app.listen(port, () => {
    console.log(`Entegra Assessment Portal API running on http://localhost:${port}`);
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

listen(DEFAULT_PORT);
