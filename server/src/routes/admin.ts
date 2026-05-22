import { Router } from 'express';
import { syncPddProducts } from '../services/pdd-sync.js';
import { syncTbkProducts } from '../services/tbk-sync.js';

const router = Router();

// ===== 拼多多 =====

router.post('/pdd/sync', async (req, res) => {
  try {
    const { keyword, catId, pages, pageSize } = req.body || {};
    const result = await syncPddProducts({ keyword, catId, pages, pageSize });
    res.json({ message: '拼多多同步完成', ...result });
  } catch (err: any) {
    console.error('PDD sync failed:', err.message);
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
