import { useSearchParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { searchProducts } from '../data/products';
import type { SortOption } from '../types';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/ui/Pagination';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: '默认排序' },
  { value: 'sales', label: '销量优先' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'rating', label: '评分最高' },
];

const PAGE_SIZE = 12;

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [sort, setSort] = useState<SortOption>('default');
  const [page, setPage] = useState(1);

  const results = useMemo(() => {
    const filtered = searchProducts(query);
    switch (sort) {
      case 'sales':
        return [...filtered].sort((a, b) => b.sales - a.sales);
      case 'price-asc':
        return [...filtered].sort((a, b) => a.currentPrice - b.currentPrice);
      case 'price-desc':
        return [...filtered].sort((a, b) => b.currentPrice - a.currentPrice);
      case 'rating':
        return [...filtered].sort((a, b) => b.rating - a.rating);
      default:
        return filtered;
    }
  }, [query, sort]);

  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const paged = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold">
          搜索 &ldquo;{query}&rdquo;
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          共找到 {results.length} 件商品
        </p>
      </div>

      {/* Sort bar */}
      <div className="flex items-center justify-end mb-4 bg-card rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setSort(opt.value);
                setPage(1);
              }}
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

      <ProductGrid products={paged} />
      <Pagination current={page} total={totalPages} onChange={setPage} />
    </div>
  );
}
