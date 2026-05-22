import { api } from './client';

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  product_count: number;
}

export function getCategories(): Promise<{ categories: ApiCategory[] }> {
  return api.get<{ categories: ApiCategory[] }>('/categories');
}

export function getCategoryBySlug(slug: string): Promise<{ category: ApiCategory }> {
  return api.get<{ category: ApiCategory }>(`/categories/${slug}`);
}
