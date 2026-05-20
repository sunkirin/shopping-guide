import type { Product } from '../../types';
import PriceDisplay from './PriceDisplay';
import CouponBadge from './CouponBadge';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const {
    id,
    title,
    image,
    originalPrice,
    currentPrice,
    couponAmount,
    platformLabel,
    sales,
    rating,
    isNew,
    endTime,
  } = product;

  return (
    <Link
      to={`/product/${id}`}
      className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              新品
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {platformLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Title */}
        <h3 className="text-sm leading-5 line-clamp-2 text-text group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Price */}
        <PriceDisplay originalPrice={originalPrice} currentPrice={currentPrice} size="sm" />

        {/* Coupon */}
        <div className="min-h-[24px]">
          <CouponBadge amount={couponAmount} />
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-text-secondary mt-auto">
          <span>已售 {sales > 10000 ? `${(sales / 10000).toFixed(1)}万` : sales}</span>
          <span className="flex items-center gap-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fa8c16">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {rating}
          </span>
        </div>

        {/* End time */}
        <div className="text-xs text-text-secondary">
          ⏰ 截止 {endTime}
        </div>
      </div>
    </Link>
  );
}
