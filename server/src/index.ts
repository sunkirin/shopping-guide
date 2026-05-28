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
