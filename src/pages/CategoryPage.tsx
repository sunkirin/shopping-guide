import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { getProductsByCategory } from '../data/products';
import { categories } from '../data/categories';
import type { SortOption } from '../types';
import CategorySidebar from '../components/category/CategorySidebar';
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

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sort, setSort] = useState<SortOption>('default');
  const [page, setPage] = useState(1);

  const category = categories.find((c) => c.slug === slug);
  const allProducts = getProductsByCategory(slug || '');

  const sorted = useMemo(() => {
    const list = [...allProducts];
    switch (sort) {
      case 'sales':
        return list.sort((a, b) => b.sales - a.sales);
      case 'price-asc':
        return list.sort((a, b) => a.currentPrice - b.currentPrice);
      case 'price-desc':
        return list.sort((a, b) => b.currentPrice - a.currentPrice);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      default:
        return list.sort((a, b) => {
          if (a.isHot && !b.isHot) return -1;
          if (!a.isHot && b.isHot) return 1;
          return b.sales - a.sales;
        });
    }
  }, [allProducts, sort]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-sm text-text-secondary mb-4">
        <a href="/" className="hover:text-primary">首页</a>
        <span className="mx-2">/</span>
        <span className="text-text font-medium">{category?.name || '全部商品'}</span>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="hidden lg:block w-48 shrink-0">
          <CategorySidebar activeSlug={slug} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4 bg-card rounded-xl px-4 py-3">
            <h2 className="font-bold text-lg">{category?.icon} {category?.name || '全部商品'}</h2>
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

          {/* Product grid */}
          <ProductGrid products={paged} />

          {/* Pagination */}
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
