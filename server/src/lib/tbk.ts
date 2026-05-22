import crypto from 'crypto';
import { getTbkConfig } from '../config.js';

interface TbkRequest {
  method: string;
  app_key: string;
  timestamp: string;
  format: string;
  v: string;
  sign_method: string;
  sign: string;
  [key: string]: string;
}

interface TbkResponse {
  error_response?: { code: number; msg: string; sub_msg: string };
  [key: string]: any;
}

export interface TbkItem {
  item_id: number;
  title: string;
  short_title: string;
  pict_url: string;
  small_images?: { string: string[] };
  zk_final_price: string;
  reserve_price: string;
  coupon_amount: number;
  coupon_start_time: string;
  coupon_end_time: string;
  coupon_share_url: string;
  volume: number;
  nick: string;
  seller_id: number;
  user_type: number;     // 0=淘宝 1=天猫
  shop_title: string;
  category_id: number;
  category_name: string;
  item_url: string;
  commission_rate: string;
}

const TBK_CAT_MAP: Record<string, { category_id: number; category_slug: string }> = {
  '数码': { category_id: 1, category_slug: 'digital' },
  '手机': { category_id: 1, category_slug: 'digital' },
  '电脑': { category_id: 1, category_slug: 'digital' },
  '家电': { category_id: 1, category_slug: 'digital' },
  '服饰': { category_id: 2, category_slug: 'fashion' },
  '女装': { category_id: 2, category_slug: 'fashion' },
  '男装': { category_id: 2, category_slug: 'fashion' },
  '鞋': { category_id: 2, category_slug: 'fashion' },
  '箱包': { category_id: 2, category_slug: 'fashion' },
  '食品': { category_id: 3, category_slug: 'food' },
  '零食': { category_id: 3, category_slug: 'food' },
  '生鲜': { category_id: 3, category_slug: 'food' },
  '水产': { category_id: 3, category_slug: 'food' },
  '美妆': { category_id: 4, category_slug: 'beauty' },
  '个护': { category_id: 4, category_slug: 'beauty' },
  '护肤': { category_id: 4, category_slug: 'beauty' },
  '彩妆': { category_id: 4, category_slug: 'beauty' },
  '家居': { category_id: 5, category_slug: 'home' },
  '日用': { category_id: 5, category_slug: 'home' },
  '家纺': { category_id: 5, category_slug: 'home' },
  '厨具': { category_id: 5, category_slug: 'home' },
  '母婴': { category_id: 6, category_slug: 'baby' },
  '童装': { category_id: 6, category_slug: 'baby' },
  '玩具': { category_id: 6, category_slug: 'baby' },
};

function guessCategory(catName: string): { category_id: number; category_slug: string } {
  for (const [key, val] of Object.entries(TBK_CAT_MAP)) {
    if (catName.includes(key)) return val;
  }
  return { category_id: 1, category_slug: 'digital' };
}

function sign(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${k}${params[k]}`)
    .join('');
  return crypto.createHash('md5').update(secret + sorted + secret).digest('hex').toUpperCase();
}

async function callTbk(method: string, apiParams: Record<string, string> = {}): Promise<any> {
  const { appKey, appSecret } = getTbkConfig();

  if (!appKey || !appSecret) {
    throw new Error('淘宝API未配置：请设置 TBK_APP_KEY 和 TBK_APP_SECRET');
  }

  const sysParams: Record<string, string> = {
    method,
    app_key: appKey,
    timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    format: 'json',
    v: '2.0',
    sign_method: 'md5',
  };

  const allParams = { ...sysParams, ...apiParams };
  allParams.sign = sign(allParams, appSecret);

  const searchParams = new URLSearchParams(allParams);

  const res = await fetch('https://eco.taobao.com/router/rest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: searchParams.toString(),
  });

  const data = await res.json() as TbkResponse;

  if (data.error_response) {
    const err = data.error_response;
    throw new Error(`淘宝API错误 [${err.code}]: ${err.msg} — ${err.sub_msg || ''}`);
  }

  return data;
}

/**
 * 搜索淘宝客商品（通用物料搜索）
 */
export async function searchGoods(params: {
  keyword?: string;
  catId?: string;
  pageNo?: number;
  pageSize?: number;
  sort?: string;
  hasCoupon?: boolean;
  needFreeShip?: boolean;
  isTmall?: boolean;
}): Promise<{ items: TbkItem[]; total: number }> {
  const apiParams: Record<string, string> = {
    adzone_id: getTbkConfig().adzoneId || '',
    q: params.keyword || '',
    page_no: String(params.pageNo || 1),
    page_size: String(params.pageSize || 20),
    sort: params.sort || 'tk_rate_des', // 默认淘礼金佣金比例降序
    has_coupon: params.hasCoupon !== false ? 'true' : 'false',
    need_free_ship: params.needFreeShip ? 'true' : 'false',
    is_tmall: params.isTmall ? 'true' : 'false',
  };

  if (params.catId) {
    apiParams.cat = params.catId;
  }

  const data = await callTbk('taobao.tbk.dg.material.optional', apiParams);

  const resultList = data.tbk_dg_material_optional_response?.result_list?.map_data || [];

  const items: TbkItem[] = resultList.map((raw: any) => ({
    item_id: raw.item_id,
    title: raw.title || '',
    short_title: raw.short_title || '',
    pict_url: raw.pict_url || '',
    small_images: raw.small_images,
    zk_final_price: raw.zk_final_price || '0',
    reserve_price: raw.reserve_price || '0',
    coupon_amount: raw.coupon_amount || 0,
    coupon_start_time: raw.coupon_start_time || '',
    coupon_end_time: raw.coupon_end_time || '',
    coupon_share_url: raw.coupon_share_url || '',
    volume: raw.volume || 0,
    nick: raw.nick || '',
    seller_id: raw.seller_id || 0,
    user_type: raw.user_type ?? 0,
    shop_title: raw.shop_title || '',
    category_id: raw.category_id || 0,
    category_name: raw.category_name || '',
    item_url: raw.item_url || '',
    commission_rate: raw.commission_rate || '',
  }));

  const total = data.tbk_dg_material_optional_response?.total_results || items.length;

  return { items, total };
}

/**
 * 获取淘宝客商品详情
 */
export async function getItemDetail(itemIds: string[]): Promise<any> {
  return callTbk('taobao.tbk.item.info.get', {
    num_iids: itemIds.join(','),
  });
}

/**
 * 将淘宝客商品转换为项目 Product 格式
 */
export function mapTbkToProduct(item: TbkItem) {
  const cat = guessCategory(item.category_name);

  const smallImgList = item.small_images?.string || [];
  const images = smallImgList.length > 0
    ? smallImgList.filter(url => url && url.startsWith('http'))
    : [item.pict_url];

  const platform = item.user_type === 1 ? 'tmall' : 'taobao';
  const platformLabel = item.user_type === 1 ? '天猫' : '淘宝';

  const couponAmount = Math.round(item.coupon_amount / 100); // API 返回的是分

  const endTime = item.coupon_end_time
    ? new Date(item.coupon_end_time).toISOString().split('T')[0]
    : '';

  return {
    title: item.title || item.short_title || '',
    description: '',
    image: item.pict_url,
    images,
    original_price: Math.round(parseFloat(item.reserve_price) / 100),
    current_price: Math.round(parseFloat(item.zk_final_price) / 100),
    coupon_amount: couponAmount,
    coupon_link: item.coupon_share_url || '',
    platform,
    platform_label: platformLabel,
    category_id: cat.category_id,
    sales: item.volume || 0,
    rating: 4.5,
    buy_link: item.coupon_share_url || item.item_url || '',
    is_hot: item.volume > 10000 ? 1 : 0,
    is_new: 0,
    end_time: endTime,
    tbk_goods_id: item.item_id,
  };
}
