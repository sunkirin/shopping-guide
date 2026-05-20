import { useParams, Link } from 'react-router-dom';
import { getProductById, getProductsByCategory } from '../data/products';
import PriceDisplay from '../components/product/PriceDisplay';
import CouponBadge from '../components/product/CouponBadge';
import ProductGrid from '../components/product/ProductGrid';
import { useState } from 'react';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || '');
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-lg text-text-secondary mb-4">商品未找到</p>
        <Link to="/" className="text-primary hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  const similarProducts = getProductsByCategory(product.categorySlug)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div>
      {/* Breadcrumb */}
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
          {/* Images */}
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

          {/* Info */}
          <div className="flex flex-col gap-4">
            <h1 className="text-xl sm:text-2xl font-bold leading-relaxed">
              {product.title}
            </h1>

            <p className="text-text-secondary text-sm leading-relaxed">
              {product.description}
            </p>

            {/* Price */}
            <div className="bg-primary-light/50 rounded-xl p-4">
              <PriceDisplay
                originalPrice={product.originalPrice}
                currentPrice={product.currentPrice}
                size="lg"
              />
              <div className="text-xs text-text-secondary mt-1">
                已售 {(product.sales / 10000).toFixed(1)}万 | 评分 {product.rating}
              </div>
            </div>

            {/* Coupon */}
            {product.couponAmount > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <CouponBadge amount={product.couponAmount} />
                <span className="text-xs text-orange-600">
                  有效期至 {product.endTime}
                </span>
              </div>
            )}

            {/* Platform & Meta */}
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {product.platformLabel}
              </span>
              {product.isNew && (
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full">
                  新品上市
                </span>
              )}
              {product.isHot && (
                <span className="bg-red-100 text-red-500 px-3 py-1 rounded-full">
                  热销爆款
                </span>
              )}
            </div>

            {/* CTA */}
            <a
              href={product.buyLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.preventDefault()}
              className="bg-primary text-white text-center font-bold text-lg py-3 rounded-full hover:bg-primary-dark transition-colors"
            >
              去购买 →
            </a>
          </div>
        </div>
      </div>

      {/* Similar products */}
      {similarProducts.length > 0 && (
        <section className="mt-12">
          <h3 className="text-lg font-bold mb-4">📦 同类推荐</h3>
          <ProductGrid products={similarProducts} />
        </section>
      )}
    </div>
  );
}
