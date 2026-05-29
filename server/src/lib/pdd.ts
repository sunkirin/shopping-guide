import crypto from 'crypto';
import { getPddConfig } from '../config.js';

interface PddResponse {
  error_response?: { error_code: number; error_msg: string };
  [key: string]: any;
}

export interface PddGoodsBasic {
  goods_id: number;
  goods_sign: string;
  goods_name: string;
  goods_desc: string;
  goods_thumbnail_url: string;
  goods_image_url: string;
  goods_gallery_urls: string;
  min_group_price: number;       // 拼团价（分）
  min_normal_price: number;      // 单独购买价（分）
  coupon_discount: number;       // 优惠券面额（分）
  coupon_min_order_amount: number;
  coupon_remain_quantity: number;
  coupon_total_quantity: number;
  coupon_start_time: number;
  coupon_end_time: number;
  sales_tip: string;             // "已拼XX万件"
  search_id: number;
  mall_id: number;
  mall_name: string;
  cat_ids: number[];
  opt_id: number;
  opt_name: string;
  has_coupon: boolean;
  has_mall_coupon: boolean;
  only_coupon: boolean;
  plan_type: number;
  merchant_type: number;
  cat_id: number;
  category_name: string;
}

export interface PddSearchResponse {
  goods_search_response: {
    goods_list: PddGoodsBasic[];
    total_count: number;
    list_id: string;
  };
}

// 拼多多分类映射到我们的分类
const PDD_CAT_MAP: Record<string, { category_id: number; category_slug: string }> = {
  '服饰': { category_id: 2, category_slug: 'fashion' },
  '鞋包': { category_id: 2, category_slug: 'fashion' },
  '食品': { category_id: 3, category_slug: 'food' },
  '生鲜': { category_id: 3, category_slug: 'food' },
  '美妆': { category_id: 4, category_slug: 'beauty' },
  '个护': { category_id: 4, category_slug: 'beauty' },
  '数码': { category_id: 1, category_slug: 'digital' },
  '家电': { category_id: 1, category_slug: 'digital' },
  '手机': { category_id: 1, category_slug: 'digital' },
  '家居': { category_id: 5, category_slug: 'home' },
  '日用': { category_id: 5, category_slug: 'home' },
  '母婴': { category_id: 6, category_slug: 'baby' },
  '童装': { category_id: 6, category_slug: 'baby' },
};

function guessCategory(catName: string): { category_id: number; category_slug: string } {
  for (const [key, val] of Object.entries(PDD_CAT_MAP)) {
    if (catName.includes(key)) return val;
  }
  return { category_id: 1, category_slug: 'digital' }; // 默认数码
}

/**
 * 拼多多 API 签名
 * 规则：按参数名首字母升序排列，拼接为 k1v1k2v2...，尾部追加 client_secret，MD5大写
 */
function sign(params: Record<string, any>, clientSecret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${k}${params[k]}`)
    .join('');
  return crypto.createHash('md5').update(clientSecret + sorted + clientSecret).digest('hex').toUpperCase();
}

/**
 * 调用拼多多 API
 */
async function callPdd(type: string, apiParams: Record<string, any> = {}): Promise<any> {
  const { clientId, clientSecret } = getPddConfig();

  if (!clientId || !clientSecret) {
    throw new Error('拼多多API未配置：请设置 PDD_CLIENT_ID 和 PDD_CLIENT_SECRET');
  }

  const allParams: Record<string, string> = {
    type,
    client_id: clientId,
    timestamp: String(Math.floor(Date.now() / 1000)),
    data_type: 'JSON',
  };

  for (const [k, v] of Object.entries(apiParams)) {
    if (v !== undefined && v !== null && v !== '') {
      allParams[k] = String(v);
    }
  }

  allParams.sign = sign(allParams, clientSecret);

  const res = await fetch('https://gw-api.pinduoduo.com/api/router', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(allParams).toString(),
  });

  const data = await res.json() as PddResponse;

  if (data.error_response) {
    const err = data.error_response;
    throw new Error(`拼多多API错误 [${err.error_code}]: ${err.error_msg}`);
  }

  return data;
}

/**
 * 搜索有优惠券的商品
 */
export async function searchGoods(params: {
  keyword?: string;
  catId?: number;
  page?: number;
  pageSize?: number;
  sortType?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  withCoupon?: boolean;
  rangeList?: string;
  listId?: string;
}): Promise<PddSearchResponse> {
  const { pid } = getPddConfig();
  const data = await callPdd('pdd.ddk.goods.search', {
    pid,
    keyword: params.keyword || '',
    cat_id: params.catId,
    page: params.page || 1,
    page_size: params.pageSize || 20,
    sort_type: params.sortType ?? 0,
    with_coupon: params.withCoupon !== false,
    range_list: params.rangeList,
    list_id: params.listId,
  });

  return data as PddSearchResponse;
}

/**
 * 获取推荐商品（每次返回不同商品）
 */
export async function getRecommendGoods(limit: number = 20): Promise<PddGoodsBasic[]> {
  const { pid } = getPddConfig();
  const data = await callPdd('pdd.ddk.goods.recommend.get', {
    pid,
    limit: String(limit),
  });
  return data?.goods_basic_detail_response?.list || [];
}

/**
 * 获取商品详情
 */
export async function getGoodsDetail(goodsIds: number[]): Promise<any> {
  const { pid } = getPddConfig();
  return callPdd('pdd.ddk.goods.detail', {
    pid,
    goods_id_list: JSON.stringify(goodsIds),
  });
}

/**
 * 生成多多进宝推广链接
 * 为指定商品生成带佣金的购买链接和优惠券链接
 *
 * @param goodsList [{goodsId, goodsSign}] 商品ID和goods_sign对
 */
export async function generatePromotionUrls(
  goodsList: { goodsId: number; goodsSign: string }[],
): Promise<Map<number, { buyLink: string; couponLink: string; shortUrl: string }>> {
  const signs = goodsList.map(g => g.goodsSign);

  const data = await callPdd('pdd.ddk.goods.promotion.url.generate', {
    p_id: getPddConfig().pid,
    goods_sign_list: JSON.stringify(signs),
    generate_short_url: true,
    generate_mobile: true,
    multi_group: true,
  });

  const result = new Map<number, { buyLink: string; couponLink: string; shortUrl: string }>();
  const list = data?.goods_promotion_url_generate_response?.goods_promotion_url_list || [];

  for (const item of list) {
    // 从 URL 中提取 goods_id
    const idMatch = (item.mobile_url || item.url || '').match(/goods_id=(\d+)/);
    const goodsId = item.goods_id || (idMatch ? Number(idMatch[1]) : 0);

    if (goodsId > 0) {
      result.set(goodsId, {
        buyLink: item.mobile_url || item.url || '',
        couponLink: item.mobile_short_url || item.short_url || item.mobile_url || item.url || '',
        shortUrl: item.short_url || item.mobile_short_url || '',
      });
    }
  }

  return result;
}

/**
 * 查询 PID 是否已授权备案
 * 返回 bind=1 表示已备案
 */
export async function checkMemberAuthority(): Promise<{ bind: boolean; msg: string }> {
  const data = await callPdd('pdd.ddk.member.authority.query', {
    pid: getPddConfig().pid,
  });

  const resp = data?.member_authority_query_response;
  const bind = resp?.bind === 1;
  return {
    bind,
    msg: bind ? '已授权备案' : '未授权备案',
  };
}

/**
 * 生成授权备案链接
 * 需要先搜索一个商品获取 goods_sign，然后生成授权链接
 * 用户点击链接后完成 PID 授权
 */
export async function generateAuthorityUrl(): Promise<{ url: string; shortUrl: string }> {
  // 先搜一个商品拿 goods_sign
  const searchRes = await searchGoods({ pageSize: 10, withCoupon: true });
  const goodsList = searchRes.goods_search_response?.goods_list || [];
  if (goodsList.length === 0) {
    throw new Error('无法获取商品用于生成授权链接');
  }

  const data = await callPdd('pdd.ddk.goods.promotion.url.generate', {
    p_id: getPddConfig().pid,
    goods_sign_list: JSON.stringify([goodsList[0].goods_sign]),
    generate_authority_url: true,
  });

  const resp = data?.goods_promotion_url_generate_response?.goods_promotion_url_list?.[0] || {};
  return {
    url: resp.mobile_url || resp.url || '',
    shortUrl: resp.mobile_short_url || resp.short_url || '',
  };
}

/**
 * 将拼多多商品转换为我们的 Product 格式
 */
export function mapPddToProduct(
  pdd: PddGoodsBasic,
  promotion?: { buyLink: string; couponLink: string; shortUrl: string },
) {
  const cat = guessCategory(pdd.category_name || pdd.opt_name || '');
  const couponAmount = Math.round(pdd.coupon_discount / 100); // 分→元

  const imagesRaw = pdd.goods_gallery_urls
    ? (typeof pdd.goods_gallery_urls === 'string'
        ? pdd.goods_gallery_urls.split(',')
        : pdd.goods_gallery_urls)
    : [];
  const images = imagesRaw.length > 0
    ? imagesRaw.filter((url: string) => url && url.startsWith('http'))
    : [pdd.goods_image_url || pdd.goods_thumbnail_url];

  const salesMatch = pdd.sales_tip?.match(/([\d.]+)/);
  const sales = salesMatch
    ? parseFloat(salesMatch[1]) * (pdd.sales_tip.includes('万') ? 10000 : 1)
    : 0;

  const endTime = pdd.coupon_end_time
    ? new Date(pdd.coupon_end_time * 1000).toISOString().split('T')[0]
    : '';

  return {
    title: pdd.goods_name,
    description: pdd.goods_desc || '',
    image: pdd.goods_thumbnail_url || pdd.goods_image_url || '',
    images,
    original_price: Math.round(pdd.min_normal_price / 100),
    current_price: Math.round(pdd.min_group_price / 100),
    coupon_amount: couponAmount,
    coupon_link: promotion?.couponLink || '',
    platform: 'pdd',
    platform_label: '拼多多',
    category_id: cat.category_id,
    sales,
    rating: 4.5,
    buy_link: promotion?.buyLink || '',
    is_hot: couponAmount > 10 ? 1 : 0,
    is_new: 0,
    end_time: endTime,
    pdd_goods_id: pdd.goods_id,
  };
}
