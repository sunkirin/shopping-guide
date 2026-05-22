import { api } from './client';

export interface ApiProduct {
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
  is_hot: boolean;
  is_new: boolean;
  end_time: string;
}

export interface ProductsResponse {
  products: ApiProduct[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProductDetailResponse {
  product: ApiProduct;
}

export function getProducts(params?: {
  category?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params?.search) searchParams.set('search', params.search);

  const qs = searchParams.toString();
  return api.get<ProductsResponse>(`/products${qs ? `?${qs}` : ''}`);
}

export function getProductById(id: number | string): Promise<ProductDetailResponse> {
  return api.get<ProductDetailResponse>(`/products/${id}`);
}

export function getHotProducts(): Promise<{ products: ApiProduct[] }> {
  return api.get<{ products: ApiProduct[] }>('/products/hot');
}
