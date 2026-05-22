import { searchGoods, mapPddToProduct, type PddGoodsBasic } from '../lib/pdd.js';
import { getDatabase, dbRun, saveDatabase } from '../database.js';

const PDD_ID_FIELD = 'pdd_goods_id';

/**
 * 确保 products 表有 pdd_goods_id 字段（用于去重）
 */
function ensurePddColumn() {
  try {
    dbRun(`ALTER TABLE products ADD COLUMN ${PDD_ID_FIELD} INTEGER`);
  } catch {
    // 字段已存在则忽略
  }
}

/**
 * 从拼多多拉取带优惠券的商品，写入数据库（按 pdd_goods_id 去重）
 *
 * @param keyword  搜索关键词
 * @param catId    拼多多类目ID（可选）
 * @param pages    拉取页数
 * @param pageSize 每页数量
 * @returns 本次新增的商品数量
 */
export async function syncPddProducts(params: {
  keyword?: string;
  catId?: number;
  pages?: number;
  pageSize?: number;
} = {}): Promise<{ added: number; total: number }> {
  const db = await getDatabase();
  ensurePddColumn();

  const { keyword = '', catId, pages = 3, pageSize = 20 } = params;
  let added = 0;
  let total = 0;

  for (let page = 1; page <= pages; page++) {
    const res = await searchGoods({
      keyword,
      catId,
      page,
      pageSize,
      withCoupon: true,
      sortType: 0, // 综合排序
    });

    const list = res.goods_search_response?.goods_list || [];
    total += list.length;

    for (const pdd of list) {
      const product = mapPddToProduct(pdd);

      // 检查 pdd_goods_id 是否已存在
      const existing = db.exec(
        `SELECT id FROM products WHERE ${PDD_ID_FIELD} = ${product.pdd_goods_id}`
      );

      // sql.js exec return is weird, use prepare
      try {
        const stmt = db.prepare(`SELECT id FROM products WHERE ${PDD_ID_FIELD} = ?`);
        stmt.bind([product.pdd_goods_id]);
        const exists = stmt.step();
        stmt.free();

        if (exists) continue;

        const insertSql = `INSERT INTO products (
          title, description, image, images, original_price, current_price,
          coupon_amount, coupon_link, platform, platform_label, category_id,
          sales, rating, buy_link, is_hot, is_new, end_time, ${PDD_ID_FIELD}
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(insertSql, [
          product.title,
          product.description,
          product.image,
          JSON.stringify(product.images),
          product.original_price,
          product.current_price,
          product.coupon_amount,
          product.coupon_link,
          product.platform,
          product.platform_label,
          product.category_id,
          product.sales,
          product.rating,
          product.buy_link,
          product.is_hot,
          product.is_new,
          product.end_time,
          product.pdd_goods_id,
        ]);

        added++;
      } catch (err) {
        console.error(`Failed to insert PDD product ${pdd.goods_id}:`, err);
      }
    }

    if (list.length < pageSize) break; // 最后一页不足，提前结束
  }

  if (added > 0) saveDatabase();

  return { added, total };
}

/**
 * 同步热门推荐商品
 */
export async function syncPddHotProducts(): Promise<{ added: number }> {
  // 搜索热销 + 高额优惠券
  const result = await syncPddProducts({
    keyword: '',
    pages: 2,
    pageSize: 20,
  });
  return { added: result.added };
}
