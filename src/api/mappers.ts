import type { Product, Category } from '../types';
import type { ApiProduct } from './products';
import type { ApiCategory } from './categories';

export function mapApiProduct(api: ApiProduct): Product {
  return {
    id: String(api.id),
    title: api.title,
    description: api.description,
    image: api.image,
    images: api.images,
    originalPrice: api.original_price,
    currentPrice: api.current_price,
    couponAmount: api.coupon_amount,
    couponLink: api.coupon_link,
    platform: api.platform as Product['platform'],
    platformLabel: api.platform_label,
    category: api.category_name || '',
    categorySlug: api.category_slug || '',
    sales: api.sales,
    rating: api.rating,
    buyLink: api.buy_link,
    isHot: api.is_hot,
    isNew: api.is_new,
    endTime: api.end_time,
  };
}

export function mapApiCategory(api: ApiCategory): Category {
  return {
    id: String(api.id),
    name: api.name,
    slug: api.slug,
    icon: api.icon,
    productCount: api.product_count,
  };
}
