import type { Product } from './types';

export class AdminError extends Error {
  fields?: Record<string, string>;

  constructor(message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'AdminError';
    this.fields = fields;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new AdminError('We could not reach the store service. Please try again.');
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (payload && typeof payload.error === 'string' && payload.error) ||
      'Something went wrong. Please try again.';
    throw new AdminError(message, payload?.fields);
  }

  return payload as T;
}

export type AdminSession = {
  configured: boolean;
  hasAccount: boolean;
  authenticated: boolean;
  email: string | null;
};

export type AdminOrder = {
  orderNumber: string;
  name: string;
  email: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  placedAt: string;
  itemCount: number;
};

export type AdminSubscriber = { email: string; joinedAt: string };
export type AdminMessage = {
  name: string;
  email: string;
  topic: string;
  message: string;
  sentAt: string;
};

export type ProductPayload = {
  name: string;
  slug?: string;
  categorySlug: string;
  tagline?: string;
  description?: string;
  price: number;
  compareAtPrice?: number | null;
  badge?: string | null;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  colors?: string[];
  specs?: { label: string; value: string }[];
  images?: string[];
  tabs?: string[];
  sortOrder?: number;
};

export const ORDER_STATUSES = ['demo_unpaid', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export const adminApi = {
  session: () => request<AdminSession>('/admin/session'),

  setup: (email: string, password: string) =>
    request<{ email: string }>('/admin/setup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ email: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<{ status: string }>('/admin/logout', { method: 'POST' }),

  products: () => request<{ products: Product[] }>('/admin/products'),

  createProduct: (payload: ProductPayload) =>
    request<{ product: Product }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProduct: (id: number, payload: Partial<ProductPayload>) =>
    request<{ product: Product }>(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteProduct: (id: number) =>
    request<{ status: string }>(`/admin/products/${id}`, { method: 'DELETE' }),

  orders: () => request<{ orders: AdminOrder[] }>('/admin/orders'),

  setOrderStatus: (orderNumber: string, status: string) =>
    request<{ status: string }>(`/admin/orders/${encodeURIComponent(orderNumber)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  subscribers: () => request<{ subscribers: AdminSubscriber[] }>('/admin/subscribers'),

  messages: () => request<{ messages: AdminMessage[] }>('/admin/messages'),
};
