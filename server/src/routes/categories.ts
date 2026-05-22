import { Router } from 'express';
import { getDatabase, queryAll, queryOne, dbRun, getLastId, saveDatabase } from '../database.js';
import { authRequired, adminRequired, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/categories
router.get('/', async (_req, res) => {
  try {
    await getDatabase();
    const categories = queryAll<any>(
      `SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
       FROM categories c ORDER BY c.id`
    );
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
  try {
    await getDatabase();
    const category = queryOne<any>(
      `SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
       FROM categories c WHERE c.slug = ?`,
      [req.params.slug]
    );
    if (!category) {
      return res.status(404).json({ error: '分类不存在' });
    }
    res.json({ category });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories (admin)
router.post('/', authRequired, adminRequired, async (req: AuthRequest, res) => {
  try {
    await getDatabase();
    const { name, slug, icon } = req.body;
    if (!name || !slug || !icon) {
      return res.status(400).json({ error: '缺少必要字段' });
    }

    const existing = queryOne('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existing) {
      return res.status(400).json({ error: '该标识已存在' });
    }

    dbRun('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)', [name, slug, icon]);
    saveDatabase();
    const id = getLastId();
    const category = queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    res.status(201).json({ category });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id (admin)
router.put('/:id', authRequired, adminRequired, async (req: AuthRequest, res) => {
  try {
    await getDatabase();
    const existing = queryOne('SELECT id FROM categories WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: '分类不存在' });

    const { name, slug, icon } = req.body;
    const setClauses: string[] = [];
    const values: any[] = [];
    if (name) { setClauses.push('name = ?'); values.push(name); }
    if (slug) { setClauses.push('slug = ?'); values.push(slug); }
    if (icon) { setClauses.push('icon = ?'); values.push(icon); }

    if (setClauses.length === 0) return res.status(400).json({ error: '没有要更新的字段' });

    values.push(req.params.id);
    dbRun(`UPDATE categories SET ${setClauses.join(', ')} WHERE id = ?`, values);
    saveDatabase();
    const category = queryOne('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json({ category });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id (admin)
router.delete('/:id', authRequired, adminRequired, async (req: AuthRequest, res) => {
  try {
    await getDatabase();
    dbRun('DELETE FROM categories WHERE id = ?', [req.params.id]);
    saveDatabase();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
