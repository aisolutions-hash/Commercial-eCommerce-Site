const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

let getToken: () => string | null = () => null;

/**
 * Set the token getter function (called by the Zustand store on initialization)
 * This allows the API client to always get the latest token from the store
 */
export function setTokenGetter(fn: () => string | null) {
  getToken = fn;
  console.log('[API] Token getter initialized');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add authorization header if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...options, headers });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json();

  if (!res.ok) {
    const message = data.detail || `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  section: string | null;
}

export interface ProductRead {
  id: string;
  name: string;
  description: string | null;
  long_description: string | null;
  price: number;
  category_id: string;
  images: string[];
  rating: number;
  features: string[] | null;
  is_featured: boolean;
  is_contact_for_price: boolean;
  moq: number | null;
  uom: string | null;
}

export interface ReviewRead {
  id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  date: string;
}

export interface ProductDetail extends ProductRead {
  reviews: ReviewRead[];
}

export interface ProductList {
  items: ProductRead[];
  total: number;
  page: number;
  per_page: number;
}

export interface OrderRead {
  id: string;
  user_id: string;
  items: { product_id: string; quantity: number; price: number }[];
  total: number;
  status: string;
  created_at: string;
}

export interface UserRead {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface WishlistRead {
  id: string;
  user_id: string;
  product_id: string;
}

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>('/categories');
}

export async function getProducts(params?: {
  category_id?: string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ProductList> {
  const query = new URLSearchParams();
  if (params?.category_id) query.set('category_id', params.category_id);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.per_page) query.set('per_page', String(params.per_page));
  const qs = query.toString();
  return request<ProductList>(`/products${qs ? `?${qs}` : ''}`);
}

export async function getProduct(id: string): Promise<ProductDetail> {
  return request<ProductDetail>(`/products/${encodeURIComponent(id)}`);
}

export async function login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
  return request<{ access_token: string; token_type: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string): Promise<{ access_token: string; token_type: string }> {
  return request<{ access_token: string; token_type: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function getProfile(): Promise<UserRead> {
  return request<UserRead>('/users/profile');
}

export async function placeOrder(items: { product_id: string; quantity: number }[]): Promise<OrderRead> {
  return request<OrderRead>('/orders', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export async function getOrders(): Promise<OrderRead[]> {
  return request<OrderRead[]>('/orders');
}

export async function getWishlist(): Promise<WishlistRead[]> {
  return request<WishlistRead[]>('/wishlist');
}

export async function addToWishlist(productId: string): Promise<WishlistRead> {
  return request<WishlistRead>(`/wishlist/${encodeURIComponent(productId)}`, {
    method: 'POST',
  });
}

export async function removeFromWishlist(productId: string): Promise<void> {
  return request<void>(`/wishlist/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
}
