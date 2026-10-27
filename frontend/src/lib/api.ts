/** Thin typed wrapper around the store REST API (same origin, proxied to the API service). */

export type ProductColor = { name: string; hex: string };
export type ProductSpec = { label: string; value: string };

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  subtitle: string;
  description: string;
  priceCents: number;
  badge: string | null;
  rating: number;
  reviewCount: number;
  stock: number;
  inStock: boolean;
  image: string;
  images: string[];
  colors: ProductColor[];
  specs: ProductSpec[];
  isBestseller: boolean;
  isNew: boolean;
  isPremium: boolean;
  releasedAt: string;
};

export type Category = {
  slug: string;
  name: string;
  tagline: string;
  blurb: string;
  image: string;
  productCount: number;
};

export type Customer = { id: number; email: string; name: string; createdAt?: string };

export type CartLine = {
  slug: string;
  name: string;
  subtitle: string;
  image: string;
  priceCents: number;
  quantity: number;
  stock: number;
};

export type OrderItem = {
  slug: string | null;
  name: string;
  subtitle: string;
  image: string;
  unitPriceCents: number;
  quantity: number;
};

export type Order = {
  number: string;
  status: string;
  name: string;
  email: string;
  shipping: {
    address1: string;
    address2: string;
    city: string;
    postalCode: string;
    country: string;
  };
  notes: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  createdAt: string;
  lookupToken?: string;
  items: OrderItem[];
};

export type ProductQuery = {
  q?: string;
  category?: string;
  sort?: string;
  tab?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  minRating?: string | number;
  inStock?: string;
  limit?: string | number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (payload && typeof payload.error === 'string' && payload.error) ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload as T;
}

function toQueryString(params: ProductQuery): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  categories: () => request<{ categories: Category[] }>('/api/categories'),

  products: (params: ProductQuery = {}) =>
    request<{ products: Product[] }>(`/api/products${toQueryString(params)}`),

  product: (slug: string) =>
    request<{ product: Product; related: Product[] }>(`/api/products/${encodeURIComponent(slug)}`),

  subscribe: (email: string) =>
    request<{ ok: boolean; alreadySubscribed: boolean; message: string }>('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  me: () => request<{ customer: Customer | null }>('/api/auth/me'),

  login: (email: string, password: string) =>
    request<{ customer: Customer }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: { email: string; name: string; password: string }) =>
    request<{ customer: Customer }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),

  favorites: () => request<{ slugs: string[] }>('/api/favorites'),

  addFavorite: (slug: string) =>
    request<{ ok: boolean }>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ slug }),
    }),

  removeFavorite: (slug: string) =>
    request<{ ok: boolean }>(`/api/favorites/${encodeURIComponent(slug)}`, { method: 'DELETE' }),

  syncFavorites: (slugs: string[]) =>
    request<{ slugs: string[] }>('/api/favorites/sync', {
      method: 'POST',
      body: JSON.stringify({ slugs }),
    }),

  createOrder: (payload: {
    name: string;
    email: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    postalCode: string;
    country: string;
    notes: string;
    items: { slug: string; quantity: number }[];
  }) =>
    request<{ order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  order: (number: string, token: string) =>
    request<{ order: Order }>(
      `/api/orders/${encodeURIComponent(number)}?token=${encodeURIComponent(token)}`,
    ),
};
