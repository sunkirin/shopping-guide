import type { Product } from '../../types';
import PriceDisplay from './PriceDisplay';
import { Link } from 'react-router-dom';

const PLATFORM_COLORS: Record<string, string> = {
  '淘宝': 'bg-[#FF5C00]',
  '天猫': 'bg-[#FF0036]',
  '京东': 'bg-[#E2231A]',
  '拼多多': 'bg-[#E02E24]',
};

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
      className="group dopamine-card flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && (
            <span className="bg-gradient-to-r from-[#4ECDC4] to-[#A8E6CF] text-white text-xs px-2.5 py-0.5 rounded-full font-bold shadow-md">
              NEW
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <span className={`${PLATFORM_COLORS[platformLabel] || 'bg-gray-700'} text-white text-xs px-2.5 py-0.5 rounded-full font-bold shadow-md`}>
            {platformLabel}
          </span>
        </div>
        {/* Price tag overlay */}
        {couponAmount > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
            <span className="text-white text-xs font-bold bg-[#FF4081] px-2 py-0.5 rounded-full">
              券减¥{couponAmount}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="text-sm leading-5 line-clamp-2 text-text font-medium group-hover:text-[#FF4081] transition-colors">
          {title}
        </h3>

        <PriceDisplay originalPrice={originalPrice} currentPrice={currentPrice} size="sm" />

        <div className="flex items-center justify-between text-xs text-text-secondary mt-auto">
          <span>已售 {sales > 10000 ? `${(sales / 10000).toFixed(1)}万` : sales}</span>
          <span className="flex items-center gap-0.5 font-bold text-[#FFB300]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFB300">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {rating}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          截止 {endTime}
        </div>
      </div>
    </Link>
  );
}
