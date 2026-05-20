import { products } from '../../data/products';
import ProductGrid from '../product/ProductGrid';

export default function ProductFeed() {
  // Sort by hot first, then by sales
  const sorted = [...products].sort((a, b) => {
    if (a.isHot && !b.isHot) return -1;
    if (!a.isHot && b.isHot) return 1;
    return b.sales - a.sales;
  });

  return (
    <section>
      <h3 className="text-lg font-bold mb-4">📦 精选好物</h3>
      <ProductGrid products={sorted} />
    </section>
  );
}
