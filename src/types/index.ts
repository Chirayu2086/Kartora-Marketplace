export type VisualKind =
  | "footwear" | "mobile" | "headphones" | "tv" | "fashion" | "beauty"
  | "home" | "furniture" | "sports" | "books" | "automotive" | "toys";

export interface Review {
  user: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  parentCategorySlug: string;
  gender?: "men" | "women" | "kids";
  price: number;
  mrp: number;
  rating: number;
  reviewCount: number;
  stock: number;
  isSponsored: boolean;
  isHotDeal: boolean;
  isAssured: boolean;
  colors: string[];
  sizes: string[];
  description: string;
  visual: { kind: VisualKind; hue: number };
  createdAt: string;
  reviews: Review[];
}

export interface CategoryNode {
  name: string;
  slug: string;
  visual: VisualKind;
  children?: CategoryNode[];
}

export type SearchSort = "relevance" | "popularity" | "price-asc" | "price-desc" | "newest";

export interface SearchParams {
  q?: string;
  category?: string;
  brands: string[];
  priceBuckets: string[];
  ratings: string[];
  discounts: string[];
  genders: string[];
  inStock: boolean;
  sort: SearchSort;
  page: number;
}

export interface SearchResult {
  items: CatalogProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CartItemState {
  productId: string;
  qty: number;
  size?: string;
  color?: string;
}

export interface Totals {
  mrpTotal: number;
  priceTotal: number;
  itemDiscount: number;
  couponDiscount: number;
  delivery: number;
  total: number;
}

export type OrderStatus =
  | "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED"
  | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "REFUNDED";

export interface AddressSnapshot {
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  price: number;
  qty: number;
  kind: VisualKind;
  hue: number;
}

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  status: OrderStatus;
  address: AddressSnapshot;
  totals: Totals;
  items: OrderItemSnapshot[];
}
