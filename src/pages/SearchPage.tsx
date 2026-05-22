import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { SortOption, Product } from '../types';
import ProductGrid from '../components/product/ProductGrid';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { getProducts } from '../api/products';
import { mapApiProduct } from '../api/mappers';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: '默认排序' },
  { value: 'sales', label: '销量优先' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'rating', label: '评分最高' },
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [sort, setSort] = useState<SortOption>('default');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setPage(1);
    getProducts({ search: query, sort, page: 1, pageSize: 12 })
      .then(res => {
        setProducts(res.products.map(mapApiProduct));
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    if (!query || page === 1) return;
    getProducts({ search: query, sort, page, pageSize: 12 })
      .then(res => setProducts(res.products.map(mapApiProduct)))
      .catch(() => {});
  }, [sort, page]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-black">搜索 &ldquo;{query}&rdquo;</h2>
        <p className="text-sm text-text-secondary mt-1">共找到 {total} 件商品</p>
      </div>

      <div className="flex items-center justify-end mb-4 bg-card rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setSort(opt.value); setPage(1); }}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                sort === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : (
        <ProductGrid products={products} />
      )}

      <Pagination current={page} total={totalPages} onChange={setPage} />
    </div>
  );
}
