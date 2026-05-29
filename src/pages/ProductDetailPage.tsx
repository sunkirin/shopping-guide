import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PriceDisplay from '../components/product/PriceDisplay';
import CouponBadge from '../components/product/CouponBadge';
import ProductGrid from '../components/product/ProductGrid';
import { getProductById, getProducts } from '../api/products';
import { mapApiProduct } from '../api/mappers';
import type { Product } from '../types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProductById(id)
      .then(async (res) => {
        const p = mapApiProduct(res.product);
        setProduct(p);
        // Load similar products
        try {
          const simRes = await getProducts({ category: p.categorySlug, pageSize: 4 });
          setSimilar(simRes.products.map(mapApiProduct).filter(sp => sp.id !== p.id).slice(0, 4));
        } catch {}
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-8 animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-12 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-lg text-text-secondary mb-4">商品未找到</p>
        <Link to="/" className="text-primary hover:underline">返回首页</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-sm text-text-secondary mb-4">
        <Link to="/" className="hover:text-primary">首页</Link>
        <span className="mx-2">/</span>
        <Link to={`/category/${product.categorySlug}`} className="hover:text-primary">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text">{product.title}</span>
      </div>

      <div className="bg-card rounded-2xl p-4 sm:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
              <img
                src={product.images[activeImage] || product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImage ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-xl sm:text-2xl font-bold leading-relaxed">{product.title}</h1>
            <p className="text-text-secondary text-sm leading-relaxed">{product.description}</p>

            {/* 价格 */}
            <div className="bg-red-50 rounded-xl p-4">
              <PriceDisplay originalPrice={product.originalPrice} currentPrice={product.currentPrice} size="lg" />
              <div className="text-xs text-text-secondary mt-1">
                已售 {(product.sales / 10000).toFixed(1)}万 | 评分 {product.rating}
              </div>
            </div>

            {/* Step 1: 领券 */}
            {product.couponAmount > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-orange-400 rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs opacity-80 mb-1">第一步 · 领取优惠券</div>
                    <div className="text-3xl font-black">¥{product.couponAmount}</div>
                    <div className="text-xs opacity-70 mt-1">有效期至 {product.endTime}</div>
                  </div>
                  <a
                    href={product.couponLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={!product.couponLink ? (e) => e.preventDefault() : undefined}
                    className={`px-6 py-3 rounded-full text-sm font-black transition-transform hover:scale-105 ${
                      product.couponLink
                        ? 'bg-white text-red-500 cursor-pointer'
                        : 'bg-white/50 text-white cursor-not-allowed'
                    }`}
                  >
                    {product.couponLink ? '立即领券' : '暂无券'}
                  </a>
                </div>
              </div>
            )}

            {/* Step 2: 购买 */}
            <a
              href={product.buyLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={!product.buyLink ? (e) => e.preventDefault() : undefined}
              className={`flex items-center justify-center gap-2 text-center font-black text-lg py-4 rounded-2xl transition-all ${
                product.buyLink
                  ? 'bg-gradient-to-r from-[#FF4081] to-[#FF6D3A] text-white hover:scale-105 shadow-lg shadow-pink/30 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">第二步</span>
              {product.buyLink ? '立即购买' : '暂无链接'}
              {product.buyLink && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </a>

            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="bg-gray-100 px-3 py-1 rounded-full">{product.platformLabel}</span>
              {product.isHot && <span className="bg-red-100 text-red-500 px-3 py-1 rounded-full">热销爆款</span>}
            </div>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-12">
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <span>📦</span>
            <span className="gradient-text">同类推荐</span>
          </h3>
          <ProductGrid products={similar} />
        </section>
      )}
    </div>
  );
}
