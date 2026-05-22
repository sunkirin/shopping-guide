import { Router } from 'express';
import { syncPddProducts } from '../services/pdd-sync.js';
import { syncTbkProducts } from '../services/tbk-sync.js';
import { authRequired, adminRequired, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// ===== 拼多多 =====

/**
 * POST /api/admin/pdd/sync
 * 从拼多多拉取商品（需要管理员权限）
 */
router.post('/pdd/sync', authRequired, adminRequired, async (req: AuthRequest, res) => {
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

/**
 * POST /api/admin/tbk/sync
 * 从淘宝联盟拉取商品（需要管理员权限）
 */
router.post('/tbk/sync', authRequired, adminRequired, async (req: AuthRequest, res) => {
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
