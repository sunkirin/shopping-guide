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
    couponLink,
    platformLabel,
    sales,
    endTime,
  } = product;

  const discount = Math.round((1 - currentPrice / originalPrice) * 100);

  const handleGetCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (couponLink) {
      window.open(couponLink, '_blank');
    }
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.buyLink) {
      window.open(product.buyLink, '_blank');
    }
  };

  return (
    <Link
      to={`/product/${id}`}
      className="group bg-white rounded-2xl flex flex-col overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Platform badge */}
        <div className="absolute top-2 left-2">
          <span className={`${PLATFORM_COLORS[platformLabel] || 'bg-gray-700'} text-white text-xs px-2 py-0.5 rounded-full font-bold`}>
            {platformLabel}
          </span>
        </div>
        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-[#FF4081] to-[#FF6D3A] text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {discount}% OFF
          </div>
        )}
        {/* Coupon badge at bottom */}
        {couponAmount > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500/80 to-transparent p-2 pt-6">
            <span className="text-white text-sm font-black">券 ¥{couponAmount}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <h3 className="text-xs leading-4 line-clamp-2 text-gray-800 font-medium h-8">
          {title}
        </h3>

        <PriceDisplay originalPrice={originalPrice} currentPrice={currentPrice} size="sm" />

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>已售 {sales > 10000 ? `${(sales / 10000).toFixed(1)}万` : sales}</span>
          <span>|</span>
          <span>截止 {endTime}</span>
        </div>

        {/* Two-step action buttons */}
        <div className="flex gap-1.5 mt-1">
          {couponAmount > 0 && couponLink ? (
            <button
              onClick={handleGetCoupon}
              className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-gradient-to-r from-[#FF4081] to-[#FF6D3A] text-white hover:opacity-90 transition-opacity"
            >
              领券
            </button>
          ) : (
            <button
              onClick={handleGetCoupon}
              className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              暂无券
            </button>
          )}
          <button
            onClick={handleBuy}
            className={`flex-1 text-center text-xs font-bold py-2 rounded-lg border transition-colors ${
              product.buyLink
                ? 'border-[#FF4081] text-[#FF4081] hover:bg-red-50'
                : 'border-gray-200 text-gray-300 cursor-not-allowed'
            }`}
          >
            立即购买
          </button>
        </div>
      </div>
    </Link>
  );
}
