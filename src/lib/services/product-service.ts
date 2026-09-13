import { CATEGORIES, PRODUCTS } from "@/lib/data/catalog";
import { calculateDiscount } from "@/lib/utils";
import { PRICE_BUCKETS } from "@/lib/validations/search";
import type { CatalogProduct, SearchResult, SearchParams } from "@/types";

export const PAGE_SIZE = 40;

function matchesText(p: CatalogProduct, q: string): boolean {
  const hay = `${p.name} ${p.brand} ${p.categorySlug} ${p.description}`.toLowerCase();
  return q.toLowerCase().split(/\s+/).every((token) => hay.includes(token));
}

function categorySlugs(slug: string): string[] {
  const parent = CATEGORIES.find((c) => c.slug === slug);
  if (parent) return [parent.slug, ...(parent.children ?? []).map((c) => c.slug)];
  const child = CATEGORIES.flatMap((c) => c.children ?? []).find((c) => c.slug === slug);
  if (child) {
    const p = CATEGORIES.find((c) => (c.children ?? []).some((x) => x.slug === slug));
    return [child.slug, p?.slug ?? ""];
  }
  return [slug];
}

export function searchProducts(params: SearchParams): SearchResult {
  let items = PRODUCTS.filter((p) => {
    if (params.q && !matchesText(p, params.q)) return false;
    if (params.category && !categorySlugs(params.category).includes(p.categorySlug) && !categorySlugs(params.category).includes(p.parentCategorySlug)) return false;
    if (params.brands.length > 0 && !params.brands.includes(p.brand)) return false;
    if (params.genders.length > 0 && (!p.gender || !params.genders.includes(p.gender))) return false;
    if (params.inStock && p.stock === 0) return false;
    if (params.priceBuckets.length > 0) {
      const ok = params.priceBuckets.some((id) => {
        const b = PRICE_BUCKETS.find((x) => x.id === id);
        return b ? p.price >= b.min && p.price < b.max : false;
      });
      if (!ok) return false;
    }
    if (params.ratings.length > 0) {
      const min = Math.min(...params.ratings.map(Number));
      if (p.rating < min) return false;
    }
    if (params.discounts.length > 0) {
      const min = Math.max(...params.discounts.map(Number));
      if (calculateDiscount(p.mrp, p.price) < min) return false;
    }
    return true;
  });

  const score = (p: CatalogProduct) =>
    (p.isSponsored ? 2 : 0) + (p.isHotDeal ? 1 : 0) + p.rating + Math.log10(p.reviewCount + 1);

  switch (params.sort) {
    case "popularity": items = [...items].sort((a, b) => b.reviewCount - a.reviewCount); break;
    case "price-asc": items = [...items].sort((a, b) => a.price - b.price); break;
    case "price-desc": items = [...items].sort((a, b) => b.price - a.price); break;
    case "newest": items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
    default: items = [...items].sort((a, b) => score(b) - score(a));
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(params.page, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  return { items: items.slice(start, start + PAGE_SIZE), total, page, pageSize: PAGE_SIZE, totalPages };
}

export function getProduct(slug: string): CatalogProduct | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): CatalogProduct | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getRelated(product: CatalogProduct, count = 10): CatalogProduct[] {
  return PRODUCTS.filter((p) => p.id !== product.id && (p.categorySlug === product.categorySlug || p.brand === product.brand)).slice(0, count);
}

export function getRail(kind: "trending" | "deals" | "fashion" | "electronics" | "home"): CatalogProduct[] {
  switch (kind) {
    case "trending": return [...PRODUCTS].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 10);
    case "deals": return PRODUCTS.filter((p) => p.isHotDeal).slice(0, 10);
    case "fashion": return PRODUCTS.filter((p) => ["fashion", "footwear"].includes(p.parentCategorySlug)).slice(0, 10);
    case "electronics": return PRODUCTS.filter((p) => ["mobiles", "electronics"].includes(p.parentCategorySlug)).slice(0, 10);
    case "home": return PRODUCTS.filter((p) => ["home-kitchen", "furniture"].includes(p.categorySlug) || ["home-kitchen", "furniture"].includes(p.parentCategorySlug)).slice(0, 10);
  }
}

export function getSuggestions(q: string): { products: { name: string; slug: string }[]; categories: { name: string; slug: string }[] } {
  const term = q.trim().toLowerCase();
  if (term.length < 2) return { products: [], categories: [] };
  const categories = CATEGORIES.flatMap((c) => [c, ...(c.children ?? [])])
    .filter((c) => c.name.toLowerCase().includes(term))
    .slice(0, 3)
    .map((c) => ({ name: c.name, slug: c.slug }));
  const products = PRODUCTS.filter((p) => p.name.toLowerCase().includes(term))
    .slice(0, 6)
    .map((p) => ({ name: p.name, slug: p.slug }));
  return { products, categories };
}
