import { Link } from 'react-router-dom';
import PriceDisplay from '../product/PriceDisplay';
import CouponBadge from '../product/CouponBadge';
import type { Product } from '../../types';

interface HotDealsProps {
  products: Product[];
}

export default function HotDeals({ products }: HotDealsProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="gradient-text">热销爆款</span>
        </h3>
        <Link
          to="/search?q=hot"
          className="text-sm font-bold text-[#FF4081] hover:underline"
        >
          查看更多 →
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="dopamine-card flex gap-3 p-3 min-w-[300px] max-w-[360px] shrink-0"
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-28 h-28 object-cover rounded-xl"
            />
            <div className="flex flex-col justify-between min-w-0">
              <h4 className="text-sm line-clamp-2 font-bold">{product.title}</h4>
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
