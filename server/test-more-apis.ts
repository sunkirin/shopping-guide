import 'dotenv/config';
import crypto from 'crypto';
import { getPddConfig } from './src/config.js';

const { clientId, clientSecret, pid } = getPddConfig();

async function call(type: string, params: Record<string, string>) {
  const all: Record<string, string> = { type, client_id: clientId, timestamp: String(Math.floor(Date.now() / 1000)), data_type: 'JSON', ...params };
  const sorted = Object.keys(all).sort().map(k => k + all[k]).join('');
  all.sign = crypto.createHash('md5').update(clientSecret + sorted + clientSecret).digest('hex').toUpperCase();
  const res = await fetch('https://gw-api.pinduoduo.com/api/router', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(all).toString() });
  return res.json();
}

async function test() {
  // 推荐商品详情
  console.log('=== goods.recommend.get 返回结构 ===');
  const r = await call('pdd.ddk.goods.recommend.get', { pid, limit: '3' });
  const list = r.goods_basic_detail_response?.list || [];
  if (list.length > 0) console.log('字段:', Object.keys(list[0]).join(', '));
  for (const g of list.slice(0, 2)) {
    console.log(`  goods_id=${g.goods_id} goods_sign=${(g.goods_sign||'(无)')?.substring(0,30)}`);
    console.log(`  ${g.goods_name?.substring(0,60)}`);
    console.log(`  团购:${(g.min_group_price/100).toFixed(0)}元 券:${(g.coupon_discount/100).toFixed(0)}元`);
  }

  // 主题商品
  console.log('\n=== theme.goods.search 测试 ===');
  const themes = await call('pdd.ddk.theme.list.get', { pid, page_size: '5' });
  const themeList = themes.theme_list_get_response?.theme_list || [];
  if (themeList.length > 0) {
    const firstTheme = themeList[0];
    console.log('主题:', firstTheme.name, '(id:', firstTheme.id, ')');
    const tg = await call('pdd.ddk.theme.goods.search', { pid, theme_id: String(firstTheme.id) });
    if (tg.error_response) {
      console.log('失败:', tg.error_response.sub_msg);
    } else {
      const glist = tg.theme_list_get_response?.goods_list || [];
      console.log('返回商品:', glist.length, '条');
    }
  }
}
test();
