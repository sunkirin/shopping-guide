import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { SortOption } from '../types';
import CategorySidebar from '../components/category/CategorySidebar';
import ProductGrid from '../components/product/ProductGrid';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { mapApiProduct, mapApiCategory } from '../api/mappers';
import type { Product, Category } from '../types';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: '默认排序' },
  { value: 'sales', label: '销量优先' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'rating', label: '评分最高' },
];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sort, setSort] = useState<SortOption>('default');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const category = categories.find((c) => c.slug === slug);

  useEffect(() => {
    getCategories().then(res => setCategories(res.categories.map(mapApiCategory))).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({ category: slug, sort, page, pageSize: 12 })
      .then(res => {
        setProducts(res.products.map(mapApiProduct));
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, sort, page]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div>
      <div className="text-sm text-text-secondary mb-4">
        <a href="/" className="hover:text-primary">首页</a>
        <span className="mx-2">/</span>
        <span className="text-text font-medium">{category?.name || '全部商品'}</span>
      </div>

      <div className="flex gap-6">
        <div className="hidden lg:block w-48 shrink-0">
          <CategorySidebar activeSlug={slug} categories={categories} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 bg-card rounded-xl px-4 py-3">
            <h2 className="font-black text-lg">{category?.icon} {category?.name || '全部商品'}</h2>
            <div className="flex items-center gap-2 flex-wrap">
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
      </div>
    </div>
  );
}
