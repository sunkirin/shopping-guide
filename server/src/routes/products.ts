import { Router } from 'express';
import { getDatabase, queryAll, queryOne, dbRun, getLastId, saveDatabase } from '../database.js';
import { authRequired, adminRequired, type AuthRequest } from '../middleware/auth.js';

const router = Router();

function formatProduct(row: any) {
  return {
    ...row,
    images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
    is_hot: Boolean(row.is_hot),
    is_new: Boolean(row.is_new),
  };
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    await getDatabase();
    const { category, sort, page = '1', search, pageSize = '12' } = req.query;

    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      sql += ' AND c.slug = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count total
    const countSql = sql.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = queryOne<{ total: number }>(countSql, params);
    const total = countResult?.total || 0;

    // Sort
    switch (sort) {
      case 'sales': sql += ' ORDER BY p.sales DESC'; break;
      case 'price-asc': sql += ' ORDER BY p.current_price ASC'; break;
      case 'price-desc': sql += ' ORDER BY p.current_price DESC'; break;
      case 'rating': sql += ' ORDER BY p.rating DESC'; break;
      case 'newest': sql += ' ORDER BY p.created_at DESC'; break;
      default: sql += ' ORDER BY p.created_at DESC'; break;
    }

    // Pagination
    const limit = parseInt(pageSize as string, 10);
    const offset = (parseInt(page as string, 10) - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const products = queryAll<any>(sql, params).map(formatProduct);

    res.json({ products, total, page: parseInt(page as string, 10), totalPages: Math.ceil(total / limit) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/hot
router.get('/hot', async (_req, res) => {
  try {
    await getDatabase();
    const products = queryAll<any>(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC LIMIT 8`
    ).map(formatProduct);
    res.json({ products });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    await getDatabase();
    const product = queryOne<any>(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }
    res.json({ product: formatProduct(product) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products (admin)
router.post('/', authRequired, adminRequired, async (req: AuthRequest, res) => {
  try {
    await getDatabase();
    const {
      title, description, image, images, original_price, current_price,
      coupon_amount, coupon_link, platform, platform_label, category_id,
      sales, rating, buy_link, is_hot, is_new, end_time,
    } = req.body;

    if (!title || !original_price || !current_price || !platform || !platform_label || !category_id) {
      return res.status(400).json({ error: '缺少必要字段' });
    }

    dbRun(
      `INSERT INTO products (title, description, image, images, original_price, current_price,
       coupon_amount, coupon_link, platform, platform_label, category_id, sales, rating,
       buy_link, is_hot, is_new, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description || '', image || '', JSON.stringify(images || []),
        original_price, current_price, coupon_amount || 0, coupon_link || '',
        platform, platform_label, category_id, sales || 0, rating || 0,
        buy_link || '', is_hot ? 1 : 0, is_new ? 1 : 0, end_time || '',
      ]
    );
    saveDatabase();
    const id = getLastId();
    const product = queryOne<any>(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`, [id]
    );
    res.status(201).json({ product: product ? formatProduct(product) : null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', authRequired, adminRequired, async (req: AuthRequest, res) => {
  try {
    await getDatabase();
    const existing = queryOne<any>('SELECT id FROM products WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: '商品不存在' });

    const fields = [
      'title', 'description', 'image', 'original_price', 'current_price',
      'coupon_amount', 'coupon_link', 'platform', 'platform_label', 'category_id',
      'sales', 'rating', 'buy_link', 'end_time',
    ];
    const setClauses: string[] = [];
    const values: any[] = [];

    for (const f of fields) {
      if (req.body[f] !== undefined) {
        setClauses.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    }

    if (req.body.images !== undefined) {
      setClauses.push('images = ?');
      values.push(JSON.stringify(req.body.images));
    }
    if (req.body.is_hot !== undefined) {
      setClauses.push('is_hot = ?');
      values.push(req.body.is_hot ? 1 : 0);
    }
    if (req.body.is_new !== undefined) {
      setClauses.push('is_new = ?');
      values.push(req.body.is_new ? 1 : 0);
    }

    if (setClauses.length === 0) return res.status(400).json({ error: '没有要更新的字段' });

    values.push(req.params.id);
    dbRun(`UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`, values);
    saveDatabase();

    const product = queryOne<any>(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`, [req.params.id]
    );
    res.json({ product: product ? formatProduct(product) : null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', authRequired, adminRequired, async (req: AuthRequest, res) => {
  try {
    await getDatabase();
    dbRun('DELETE FROM products WHERE id = ?', [req.params.id]);
    saveDatabase();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
