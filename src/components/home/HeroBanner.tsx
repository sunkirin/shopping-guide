import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { products } from '../../data/products';

const banners = [
  {
    title: '🔥 限时爆款',
    subtitle: '每天精选超值好物，低至1折起',
    color: 'from-primary to-secondary',
    productId: 'd1',
  },
  {
    title: '🛍️ 大牌特卖',
    subtitle: '品质好物，价格触底',
    color: 'from-purple-500 to-pink-500',
    productId: 'b1',
  },
  {
    title: '🎉 新品首发',
    subtitle: '抢先体验最新好物',
    color: 'from-blue-500 to-cyan-500',
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
      <div className={`bg-gradient-to-r ${banner.color} rounded-2xl p-6 sm:p-10 text-white overflow-hidden relative min-h-[180px]`}>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">{banner.title}</h2>
          <p className="text-white/80 mb-4">{banner.subtitle}</p>
          <Link
            to={`/product/${banner.productId}`}
            className="inline-block bg-white text-primary font-medium px-5 py-2 rounded-full hover:bg-gray-100 transition-colors text-sm"
          >
            去看看 →
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute top-0 right-16 w-24 h-24 bg-white/10 rounded-full" />
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? 'bg-primary w-6' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
