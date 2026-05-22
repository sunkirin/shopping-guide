import { api } from './client';

export interface ApiUser {
  id: number;
  email: string;
  nickname: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

export function register(data: {
  email: string;
  password: string;
  nickname: string;
}): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', data);
}

export function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', data);
}

export function getMe(): Promise<{ user: ApiUser }> {
  return api.get<{ user: ApiUser }>('/auth/me');
}
