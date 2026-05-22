import { useState, useEffect } from 'react';
import HeroBanner from '../components/home/HeroBanner';
import CategoryNav from '../components/home/CategoryNav';
import HotDeals from '../components/home/HotDeals';
import ProductGrid from '../components/product/ProductGrid';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { getProducts, getHotProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { mapApiProduct, mapApiCategory } from '../api/mappers';
import type { Product, Category } from '../types';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, hotRes, prodRes] = await Promise.all([
          getCategories(),
          getHotProducts(),
          getProducts({ pageSize: 24 }),
        ]);
        setCategories(catRes.categories.map(mapApiCategory));
        setHotProducts(hotRes.products.map(mapApiProduct));
        setProducts(prodRes.products.map(mapApiProduct));
      } catch (err) {
        console.error('API load failed, using mock data:', err);
        // Fallback to mock data
        try {
          const mockCategories = (await import('../data/categories')).categories;
          const mockProducts = (await import('../data/products')).products;
          const { getHotProducts: mockHot } = await import('../data/products');
          setCategories(mockCategories);
          setHotProducts(mockHot());
          setProducts(mockProducts);
        } catch {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (error) {
    return <div className="text-center py-20 text-text-secondary">加载失败，请稍后重试</div>;
  }

  return (
    <div>
      <HeroBanner />
      <CategoryNav categories={categories} />
      <HotDeals products={hotProducts} />
      {loading ? (
        <>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <span>📦</span>
            <span className="gradient-text">精选好物</span>
          </h3>
          <ProductGridSkeleton count={8} />
        </>
      ) : (
        <section>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <span>📦</span>
            <span className="gradient-text">精选好物</span>
          </h3>
          <ProductGrid products={products} />
        </section>
      )}
    </div>
  );
}
