import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const banners = [
  {
    title: '限时爆款',
    subtitle: '每天精选超值好物，低至1折起',
    emoji: '🔥',
    gradient: 'from-[#FF4081] via-[#FF6D3A] to-[#FFB300]',
    productId: 'd1',
  },
  {
    title: '大牌特卖',
    subtitle: '品质好物，价格触底',
    emoji: '✨',
    gradient: 'from-[#A855F7] via-[#EC4899] to-[#FF4081]',
    productId: 'b1',
  },
  {
    title: '新品首发',
    subtitle: '抢先体验最新好物',
    emoji: '🚀',
    gradient: 'from-[#06B6D4] via-[#4ECDC4] to-[#A8E6CF]',
    productId: 'd4',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const banner = banners[current];

  return (
    <div className="relative mb-8">
      <div
        key={current}
        className={`animate-pop bg-gradient-to-br ${banner.gradient} rounded-2xl p-3 sm:p-5 text-white overflow-hidden relative shadow-lg`}
        style={{ boxShadow: '0 8px 32px rgba(255,64,129,0.2)' }}
      >
        <div className="relative z-10 flex items-center gap-4">
          <span className="text-2xl">{banner.emoji}</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-black">{banner.title}</h2>
            <p className="text-white/70 text-xs sm:text-sm">{banner.subtitle}</p>
          </div>
          <Link
            to={`/product/${banner.productId}`}
            className="shrink-0 inline-flex items-center gap-1 bg-white text-[#FF4081] font-bold px-3 py-1.5 rounded-full hover:scale-105 transition-transform text-xs shadow-md"
          >
            去看看 →
          </Link>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === current
                ? 'bg-gradient-to-r from-[#FF4081] to-[#FF6D3A] w-8'
                : 'bg-gray-200 hover:bg-gray-300 w-2.5'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
