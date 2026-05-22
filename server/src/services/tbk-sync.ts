import { searchGoods, mapTbkToProduct } from '../lib/tbk.js';
import { getDatabase, dbRun, saveDatabase } from '../database.js';

const TBK_ID_FIELD = 'tbk_goods_id';

function ensureTbkColumn() {
  try {
    dbRun(`ALTER TABLE products ADD COLUMN ${TBK_ID_FIELD} INTEGER`);
  } catch {
    // 字段已存在
  }
}

/**
 * 从淘宝联盟拉取商品，写入数据库（按 tbk_goods_id 去重）
 */
export async function syncTbkProducts(params: {
  keyword?: string;
  catId?: string;
  pages?: number;
  pageSize?: number;
  sort?: string;
  isTmall?: boolean;
} = {}): Promise<{ added: number; total: number }> {
  const db = await getDatabase();
  ensureTbkColumn();

  const { keyword = '', catId, pages = 3, pageSize = 20, sort, isTmall } = params;
  let added = 0;
  let total = 0;

  for (let page = 1; page <= pages; page++) {
    const { items } = await searchGoods({
      keyword,
      catId,
      pageNo: page,
      pageSize,
      sort,
      hasCoupon: true,
      isTmall,
    });

    total += items.length;

    for (const item of items) {
      const product = mapTbkToProduct(item);

      try {
        const stmt = db.prepare(`SELECT id FROM products WHERE ${TBK_ID_FIELD} = ?`);
        stmt.bind([product.tbk_goods_id]);
        const exists = stmt.step();
        stmt.free();

        if (exists) continue;

        db.run(
          `INSERT INTO products (
            title, description, image, images, original_price, current_price,
            coupon_amount, coupon_link, platform, platform_label, category_id,
            sales, rating, buy_link, is_hot, is_new, end_time, ${TBK_ID_FIELD}
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
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
            product.tbk_goods_id,
          ]
        );

        added++;
      } catch (err) {
        console.error(`Failed to insert TBK product ${item.item_id}:`, err);
      }
    }

    if (items.length < pageSize) break;
  }

  if (added > 0) saveDatabase();

  return { added, total };
}

/**
 * 同步高佣金热门商品
 */
export async function syncTbkHotProducts(): Promise<{ added: number }> {
  const result = await syncTbkProducts({
    keyword: '',
    pages: 2,
    pageSize: 20,
    sort: 'tk_total_sales_des', // 总销量降序
  });
  return { added: result.added };
}
