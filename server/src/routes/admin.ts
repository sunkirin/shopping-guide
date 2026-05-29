import { Router } from 'express';
import { syncPddProducts, syncPddRecommendProducts } from '../services/pdd-sync.js';
import { syncTbkProducts } from '../services/tbk-sync.js';

const router = Router();

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
