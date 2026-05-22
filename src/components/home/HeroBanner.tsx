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
        className={`animate-pop bg-gradient-to-br ${banner.gradient} rounded-3xl p-6 sm:p-10 text-white overflow-hidden relative min-h-[180px] shadow-lg`}
        style={{ boxShadow: '0 8px 32px rgba(255,64,129,0.2)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute top-10 right-32 w-16 h-16 bg-yellow/20 rounded-full" />

        <div className="relative z-10">
          <span className="text-3xl mb-3 block">{banner.emoji}</span>
          <h2 className="text-2xl sm:text-3xl font-black mb-2">{banner.title}</h2>
          <p className="text-white/80 mb-5 text-sm sm:text-base">{banner.subtitle}</p>
          <Link
            to={`/product/${banner.productId}`}
            className="inline-flex items-center gap-1.5 bg-white text-[#FF4081] font-bold px-6 py-2.5 rounded-full hover:scale-105 transition-transform text-sm shadow-md"
          >
            去看看
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
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
