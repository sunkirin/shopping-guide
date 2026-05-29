import { Router } from 'express';
import { syncPddProducts, syncPddRecommendProducts } from '../services/pdd-sync.js';
import { syncTbkProducts } from '../services/tbk-sync.js';
import { queryAll, getDatabase, dbRun, saveDatabase } from '../database.js';
import { queryOrders } from '../lib/pdd.js';

const router = Router();

// ===== 数据统计 =====

router.get('/stats', async (_req, res) => {
  try {
    await getDatabase();

    const totalVisits = queryAll<{ c: number }>('SELECT COUNT(*) as c FROM visits')[0]?.c || 0;

    const todayVisits = queryAll<{ c: number }>(
      "SELECT COUNT(*) as c FROM visits WHERE created_at >= datetime('now', 'start of day')"
    )[0]?.c || 0;

    const yesterdayVisits = queryAll<{ c: number }>(
      "SELECT COUNT(*) as c FROM visits WHERE created_at >= datetime('now', '-1 day', 'start of day') AND created_at < datetime('now', 'start of day')"
    )[0]?.c || 0;

    const totalProducts = queryAll<{ c: number }>('SELECT COUNT(*) as c FROM products')[0]?.c || 0;

    const totalOrders = queryAll<{ c: number }>('SELECT COUNT(*) as c FROM orders')[0]?.c || 0;

    const totalCommission = queryAll<{ s: number }>('SELECT COALESCE(SUM(promotion_amount), 0) as s FROM orders')[0]?.s || 0;

    const platformStats = queryAll<{ platform: string; cnt: number }>(
      'SELECT platform_label as platform, COUNT(*) as cnt FROM products GROUP BY platform_label ORDER BY cnt DESC'
    );

    res.json({
      visits: { total: totalVisits, today: todayVisits, yesterday: yesterdayVisits },
      products: { total: totalProducts, byPlatform: platformStats },
      orders: { total: totalOrders, commission: totalCommission },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ===== 订单同步 =====

router.post('/orders/sync', async (req, res) => {
  try {
    await getDatabase();
    const now = Math.floor(Date.now() / 1000);
    const yesterday = now - 86400; // 查最近24小时
    const orders = await queryOrders({ startTime: yesterday, endTime: now });

    let added = 0;
    for (const order of orders) {
      try {
        dbRun(
          'INSERT OR IGNORE INTO orders (order_sn, goods_id, goods_name, order_amount, promotion_amount, order_status, order_create_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [order.order_sn, order.goods_id, order.goods_name, order.order_amount, order.promotion_amount, order.order_status, order.order_create_time?.toString()]
        );
        added++;
      } catch { /* 重复跳过 */ }
    }
    saveDatabase();

    res.json({ message: '订单同步完成', added, total: orders.length });
  } catch (err: any) {
    console.error('Order sync failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===== 拼多多 =====

router.post('/pdd/sync', async (req, res) => {
  try {
    const { keyword, catId, pages, pageSize, sortType } = req.body || {};
    const result = await syncPddProducts({ keyword, catId, pages, pageSize, sortType });
    res.json({ message: '拼多多同步完成', ...result });
  } catch (err: any) {
    console.error('PDD sync failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/pdd/recommend', async (req, res) => {
  try {
    const { batches = 5 } = req.body || {};
    const result = await syncPddRecommendProducts(batches);
    res.json({ message: '拼多多推荐商品同步完成', ...result });
  } catch (err: any) {
    console.error('PDD recommend sync failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===== 淘宝 =====

router.post('/tbk/sync', async (req, res) => {
  try {
    const { keyword, catId, pages, pageSize, sort, isTmall } = req.body || {};
    const result = await syncTbkProducts({ keyword, catId, pages, pageSize, sort, isTmall });
    res.json({ message: '淘宝同步完成', ...result });
  } catch (err: any) {
    console.error('TBK sync failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
