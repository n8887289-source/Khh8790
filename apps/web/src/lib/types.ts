export type Spec = { label: string; value: string };

export type Product = {
  id: number;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  badge: string | null;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  colors: string[];
  specs: Spec[];
  images: string[];
  tabs: string[];
};

export type Category = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
};

export type CartLine = {
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  inStock: boolean;
};

export type OrderSummary = {
  orderNumber: string;
  name: string;
  email: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  placedAt: string;
};

export type OrderItem = {
  slug: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type ProductQuery = {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  availability?: string;
  tab?: string;
  sort?: string;
};
