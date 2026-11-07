import type {
  Category,
  OrderItem,
  OrderSummary,
  Product,
  ProductQuery,
  CartLine,
} from './types';

/** Store rule, mirrored from the API: free shipping from $99, flat rate below. */
export const FREE_SHIPPING_THRESHOLD = 99;
export const FLAT_SHIPPING_RATE = 9.95;

export class ApiError extends Error {
  fields?: Record<string, string>;

  constructor(message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.fields = fields;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError('We could not reach the store service. Please check your connection.');
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (payload && typeof payload.error === 'string' && payload.error) ||
      'Something went wrong. Please try again.';
    throw new ApiError(message, payload?.fields);
  }

  return payload as T;
}

function toQuery(params: ProductQuery) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const api = {
  categories: () => request<{ categories: Category[] }>('/categories'),

  products: (params: ProductQuery = {}) =>
    request<{ products: Product[]; count: number }>(`/products${toQuery(params)}`),

  product: (slug: string) =>
    request<{ product: Product; related: Product[] }>(`/products/${encodeURIComponent(slug)}`),

  createOrder: (body: {
    customer: Record<string, string>;
    items: { slug: string; quantity: number }[];
  }) =>
    request<{ order: OrderSummary; items: OrderItem[]; payment: { processed: boolean; message: string } }>(
      '/orders',
      { method: 'POST', body: JSON.stringify(body) },
    ),

  order: (orderNumber: string, email: string) =>
    request<{ order: OrderSummary; items: OrderItem[] }>(
      `/orders/${encodeURIComponent(orderNumber)}?email=${encodeURIComponent(email)}`,
    ),

  subscribe: (email: string) =>
    request<{ status: 'subscribed' | 'already_subscribed'; message: string }>('/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  contact: (body: { name: string; email: string; topic: string; message: string }) =>
    request<{ status: string; message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export type { CartLine };
