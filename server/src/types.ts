export interface User {
  id: number;
  email: string;
  nickname: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  product_count?: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  image: string;
  images: string[];
  original_price: number;
  current_price: number;
  coupon_amount: number;
  coupon_link: string;
  platform: string;
  platform_label: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  sales: number;
  rating: number;
  buy_link: string;
  is_hot: number;
  is_new: number;
  end_time: string;
  created_at: string;
}

export interface ProductCreate {
  title: string;
  description?: string;
  image?: string;
  images?: string[];
  original_price: number;
  current_price: number;
  coupon_amount?: number;
  coupon_link?: string;
  platform: string;
  platform_label: string;
  category_id: number;
  sales?: number;
  rating?: number;
  buy_link?: string;
  is_hot?: number;
  is_new?: number;
  end_time?: string;
}
