import { searchGoods, getRecommendGoods, generatePromotionUrls, mapPddToProduct, type PddGoodsBasic } from '../lib/pdd.js';
import { getDatabase, dbRun, saveDatabase } from '../database.js';

const PDD_ID_FIELD = 'pdd_goods_id';

function ensurePddColumn() {
  try {
    dbRun(`ALTER TABLE products ADD COLUMN ${PDD_ID_FIELD} INTEGER`);
  } catch {
    // 字段已存在则忽略
  }
}

/**
 * 从拼多多拉取带优惠券的商品，写入数据库（按 pdd_goods_id 去重）
 */
export async function syncPddProducts(params: {
  keyword?: string;
  catId?: number;
  pages?: number;
  pageSize?: number;
  sortType?: number;
} = {}): Promise<{ added: number; total: number }> {
  const db = await getDatabase();
  ensurePddColumn();

  const { keyword = '', catId, pages = 3, pageSize = 20, sortType = 0 } = params;
  let added = 0;
  let total = 0;
  let listId = '';

  for (let page = 1; page <= pages; page++) {
    const res = await searchGoods({
      keyword,
      catId,
      page,
      pageSize,
      withCoupon: true,
      sortType: sortType as any,
      listId,
    });
    listId = res.goods_search_response?.list_id || '';

    const list: PddGoodsBasic[] = res.goods_search_response?.goods_list || [];
    total += list.length;

    if (list.length === 0) break;

    // 批量生成推广链接（带佣金 + 优惠券）
    const goodsList = list.map(p => ({ goodsId: p.goods_id, goodsSign: p.goods_sign }));
    let urlMap: Map<number, { buyLink: string; couponLink: string; shortUrl: string }> = new Map();

    try {
      urlMap = await generatePromotionUrls(goodsList);
    } catch (err) {
      console.error('生成推广链接失败，将使用空链接:', err);
    }

    for (const pdd of list) {
      const promo = urlMap.get(pdd.goods_id);
      const product = mapPddToProduct(pdd, promo);

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

    if (list.length < pageSize) break;
  }

  if (added > 0) saveDatabase();

  return { added, total };
}

/**
 * 同步热门推荐商品
 */
export async function syncPddHotProducts(): Promise<{ added: number }> {
  const result = await syncPddProducts({
    keyword: '',
    pages: 2,
    pageSize: 20,
  });
  return { added: result.added };
}

/**
 * 从推荐 API 同步商品（每次返回不同商品，适合批量拉取）
 */
export async function syncPddRecommendProducts(batches: number = 5): Promise<{ added: number }> {
  const db = await getDatabase();
  ensurePddColumn();

  let added = 0;

  for (let i = 0; i < batches; i++) {
    const list = await getRecommendGoods(20);
    if (list.length === 0) break;

    const goodsList = list.map(p => ({ goodsId: p.goods_id, goodsSign: p.goods_sign }));
    let urlMap: Map<number, { buyLink: string; couponLink: string; shortUrl: string }> = new Map();

    try {
      urlMap = await generatePromotionUrls(goodsList);
    } catch (err) {
      console.error('生成推广链接失败:', err);
    }

    for (const pdd of list) {
      const promo = urlMap.get(pdd.goods_id);
      const product = mapPddToProduct(pdd, promo);

      try {
        const stmt = db.prepare(`SELECT id FROM products WHERE ${PDD_ID_FIELD} = ?`);
        stmt.bind([product.pdd_goods_id]);
        const exists = stmt.step();
        stmt.free();
        if (exists) continue;

        db.run(`INSERT INTO products (
          title, description, image, images, original_price, current_price,
          coupon_amount, coupon_link, platform, platform_label, category_id,
          sales, rating, buy_link, is_hot, is_new, end_time, ${PDD_ID_FIELD}
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
          product.title, product.description, product.image, JSON.stringify(product.images),
          product.original_price, product.current_price, product.coupon_amount,
          product.coupon_link, product.platform, product.platform_label,
          product.category_id, product.sales, product.rating, product.buy_link,
          product.is_hot, product.is_new, product.end_time, product.pdd_goods_id,
        ]);
        added++;
      } catch (err) {
        console.error(`Failed to insert PDD product ${pdd.goods_id}:`, err);
      }
    }
  }

  if (added > 0) saveDatabase();
  return { added };
}
