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

            <div className="bg-primary-light/50 rounded-xl p-4">
              <PriceDisplay originalPrice={product.originalPrice} currentPrice={product.currentPrice} size="lg" />
              <div className="text-xs text-text-secondary mt-1">
                已售 {(product.sales / 10000).toFixed(1)}万 | 评分 {product.rating}
              </div>
            </div>

            {product.couponAmount > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <CouponBadge amount={product.couponAmount} />
                <span className="text-xs text-orange-600">有效期至 {product.endTime}</span>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span className="bg-gray-100 px-3 py-1 rounded-full">{product.platformLabel}</span>
              {product.isNew && <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full">新品上市</span>}
              {product.isHot && <span className="bg-red-100 text-red-500 px-3 py-1 rounded-full">热销爆款</span>}
            </div>

            <a
              href={product.buyLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.preventDefault()}
              className="bg-gradient-to-r from-[#FF4081] to-[#FF6D3A] text-white text-center font-black text-lg py-3.5 rounded-full hover:scale-105 transition-transform shadow-lg shadow-pink/30"
            >
              去购买 →
            </a>
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
