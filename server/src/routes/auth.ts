import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { queryOne, dbRun, getLastId, getDatabase } from '../database.js';
import { generateToken, authRequired, type AuthRequest } from '../middleware/auth.js';
import type { User } from '../types.js';

const router = Router();

router.get('/init', async (_req, res) => {
  await getDatabase();
  res.json({ ok: true });
});

// POST /api/auth/register
router.post('/register', async (req, res: Response) => {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password || !nickname) {
      return res.status(400).json({ error: '请填写完整信息' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6位' });
    }

    await getDatabase();
    const existing = queryOne<User>('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: '该邮箱已注册' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    dbRun('INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)', [email, password_hash, nickname]);
    const id = getLastId();

    const token = generateToken(id, 'user');
    const { saveDatabase } = await import('../database.js');
    saveDatabase();

    res.json({
      token,
      user: { id, email, nickname, role: 'user' },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '请输入邮箱和密码' });
    }

    await getDatabase();
    const user = queryOne<User & { password_hash: string }>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (!user) {
      return res.status(400).json({ error: '邮箱或密码错误' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: '邮箱或密码错误' });
    }

    const token = generateToken(user.id, user.role);
    res.json({
      token,
      user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authRequired, async (req: AuthRequest, res: Response) => {
  try {
    await getDatabase();
    const user = queryOne<User>('SELECT id, email, nickname, role, created_at FROM users WHERE id = ?', [req.userId]);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
