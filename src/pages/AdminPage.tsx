import { useState, useEffect } from 'react';
import { api } from '../api/client';

interface Stats {
  visits: { total: number; today: number; yesterday: number };
  products: { total: number; byPlatform: { platform: string; cnt: number }[] };
  orders: { total: number; commission: number };
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState('');
  const [msg, setMsg] = useState('');

  const loadStats = async () => {
    try {
      const data = await api.get<Stats>('/admin/stats');
      setStats(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { loadStats(); }, []);

  const sync = async (endpoint: string, label: string, body?: object) => {
    setSyncing(label);
    try {
      const res = await api.post<{ message: string; added: number }>(endpoint, body);
      setMsg(`${label}: ${res.message}, 新增 ${res.added} 条`);
      setTimeout(() => setMsg(''), 3000);
      loadStats();
    } catch { setMsg(`${label} 失败`); }
    setSyncing('');
  };

  if (loading) return <div className="text-center py-20 text-gray-500">加载中...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-black mb-6">数据后台</h1>

      {msg && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-bold">{msg}</div>
      )}

      {/* 访问统计 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">今日访问</div>
          <div className="text-3xl font-black text-[#FF4081]">{stats?.visits.today || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">昨日访问</div>
          <div className="text-3xl font-black">{stats?.visits.yesterday || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">总访问量</div>
          <div className="text-3xl font-black">{stats?.visits.total || 0}</div>
        </div>
      </div>

      {/* 商品统计 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">商品总数</div>
          <div className="text-3xl font-black text-[#4ECDC4]">{stats?.products.total || 0}</div>
          <div className="mt-2 space-y-1">
            {(stats?.products.byPlatform || []).map(p => (
              <div key={p.platform} className="flex justify-between text-xs text-gray-500">
                <span>{p.platform}</span>
                <span className="font-bold">{p.cnt}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">订单 / 佣金</div>
          <div className="text-3xl font-black text-[#FFB300]">{stats?.orders.total || 0}</div>
          <div className="text-xs text-gray-500 mt-1">预估佣金 ¥{((stats?.orders.commission || 0) / 100).toFixed(2)}</div>
        </div>
      </div>

      {/* 操作按钮 */}
      <h2 className="text-lg font-black mb-3">手动操作</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => sync('/admin/pdd/recommend', '推荐同步', { batches: 3 })}
          disabled={!!syncing}
          className="px-4 py-2 bg-[#E02E24] text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
        >
          {syncing === '推荐同步' ? '同步中...' : 'PDD推荐'}
        </button>
        <button
          onClick={() => sync('/admin/pdd/sync', 'PDD搜索', { pages: 5, pageSize: 10, sortType: 8 })}
          disabled={!!syncing}
          className="px-4 py-2 bg-[#FF6D3A] text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
        >
          {syncing === 'PDD搜索' ? '同步中...' : 'PDD高额券'}
        </button>
        <button
          onClick={() => sync('/admin/orders/sync', '订单同步', {})}
          disabled={!!syncing}
          className="px-4 py-2 bg-[#FFB300] text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
        >
          {syncing === '订单同步' ? '同步中...' : '同步订单'}
        </button>
      </div>
    </div>
  );
}
