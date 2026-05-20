export type Product = {
  id: string;
  title: string;
  description: string;
  image: string;
  images: string[];
  originalPrice: number;
  currentPrice: number;
  couponAmount: number;
  couponLink: string;
  platform: 'taobao' | 'jd' | 'pdd' | 'tmall';
  platformLabel: string;
  category: string;
  categorySlug: string;
  sales: number;
  rating: number;
  buyLink: string;
  isHot: boolean;
  isNew: boolean;
  endTime: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
};

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'sales' | 'rating';
