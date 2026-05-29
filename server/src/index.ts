import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { getDatabase, initDatabase, seedDatabase } from './database.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// Visit tracking
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/') && !req.path.startsWith('/api/admin')) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
    const ua = (req.headers['user-agent'] as string) || '';
    // async insert, don't block
    import('./database.js').then(({ getDatabase, dbRun }) => {
      getDatabase().then(() => {
        dbRun('INSERT INTO visits (path, ip, user_agent) VALUES (?, ?, ?)', [req.path, ip, ua]);
      }).catch(() => {});
    }).catch(() => {});
  }
  next();
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Production: serve static frontend files + SPA fallback
if (isProduction) {
  const distPath = path.join(__dirname, '..', 'public');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

async function start() {
  await getDatabase();
  initDatabase();
  seedDatabase();
  console.log('Database initialized');

  app.listen(PORT, () => {
    console.log(`[${isProduction ? 'PROD' : 'DEV'}] Server running at http://localhost:${PORT}`);
  });
}

start().catch(console.error);
