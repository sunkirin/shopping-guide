interface PriceDisplayProps {
  originalPrice: number;
  currentPrice: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceDisplay({ originalPrice, currentPrice, size = 'md' }: PriceDisplayProps) {
  const discount = Math.round((1 - currentPrice / originalPrice) * 100);

  const sizeClasses = {
    sm: { current: 'text-lg', original: 'text-xs', discount: 'text-xs' },
    md: { current: 'text-2xl', original: 'text-sm', discount: 'text-sm' },
    lg: { current: 'text-4xl', original: 'text-base', discount: 'text-base' },
  };

  const s = sizeClasses[size];

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={`${s.current} font-black gradient-text`}>
        ¥{currentPrice}
      </span>
      <span className={`${s.original} text-text-secondary line-through`}>
        ¥{originalPrice}
      </span>
      {discount > 0 && (
        <span className={`${s.discount} bg-gradient-to-r from-[#FF4081] to-[#FF6D3A] text-white font-bold px-1.5 py-0.5 rounded-lg shadow-sm`}>
          -{discount}%
        </span>
      )}
    </div>
  );
}
