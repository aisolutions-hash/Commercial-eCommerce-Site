const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

let getToken: () => string | null = () => null;

const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 60_000;

export function clearCache() {
  cache.clear();
}

export function setTokenGetter(fn: () => string | null) {
  getToken = fn;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isGet = !options.method || options.method === 'GET';
  const cacheKey = `${options.method || 'GET'} ${path}`;

  if (isGet) {
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    }
  }

  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

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

  if (isGet) {
    cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL });
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

export interface ReviewCreate {
  user_name: string;
  rating: number;
  comment: string | null;
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
  items: { product_id: string; product_name?: string; quantity: number; price: number }[];
  total: number;
  status: string;
  shipping_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_zip?: string | null;
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

export async function submitReview(productId: string, data: ReviewCreate): Promise<ReviewRead> {
  return request<ReviewRead>(`/products/${encodeURIComponent(productId)}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
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

export async function placeOrder(items: { product_id: string; quantity: number }[], shipping?: { name: string; phone: string; address: string; city: string; zip: string }): Promise<OrderRead> {
  return request<OrderRead>('/orders', {
    method: 'POST',
    body: JSON.stringify({ items, shipping: shipping || {} }),
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
