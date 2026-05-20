import { getHotProducts } from '../../data/products';
import { Link } from 'react-router-dom';
import PriceDisplay from '../product/PriceDisplay';
import CouponBadge from '../product/CouponBadge';

export default function HotDeals() {
  const hotProducts = getHotProducts();

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">🔥 热销爆款</h3>
        <Link to="/search?q=hot" className="text-sm text-primary hover:underline">
          查看更多 →
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {hotProducts.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="bg-card rounded-xl shadow-sm hover:shadow-md transition-all flex gap-3 p-3 min-w-[300px] max-w-[360px] shrink-0"
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-28 h-28 object-cover rounded-lg"
            />
            <div className="flex flex-col justify-between min-w-0">
              <h4 className="text-sm line-clamp-2 font-medium">{product.title}</h4>
              <PriceDisplay
                originalPrice={product.originalPrice}
                currentPrice={product.currentPrice}
                size="sm"
              />
              <CouponBadge amount={product.couponAmount} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
