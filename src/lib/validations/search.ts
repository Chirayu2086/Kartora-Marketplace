import type { SearchParams, SearchSort } from "@/types";

export const SORTS = ["relevance", "popularity", "price-asc", "price-desc", "newest"] as const;

export const SORT_LABELS: Record<SearchSort, string> = {
  relevance: "Relevance",
  popularity: "Popularity",
  "price-asc": "Price -- Low to High",
  "price-desc": "Price -- High to Low",
  newest: "Newest First",
};

export const PRICE_BUCKETS = [
  { id: "0-500", label: "Under ₹500", min: 0, max: 500 },
  { id: "500-1000", label: "₹500 - ₹1,000", min: 500, max: 1000 },
  { id: "1000-5000", label: "₹1,000 - ₹5,000", min: 1000, max: 5000 },
  { id: "5000-20000", label: "₹5,000 - ₹20,000", min: 5000, max: 20000 },
  { id: "20000-999999", label: "Over ₹20,000", min: 20000, max: Number.MAX_SAFE_INTEGER },
];

export const RATING_OPTIONS = ["4", "3", "2"];
export const DISCOUNT_OPTIONS = ["10", "20", "30", "40", "50", "60"];
export const GENDER_OPTIONS = [
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "kids", label: "Kids" },
];

export function parseSearchParams(raw: Record<string, string | string[]>): SearchParams {
  const get = (k: string): string | undefined => {
    const v = raw[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const getAll = (k: string): string[] => {
    const v = raw[k];
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };
  const sortRaw = get("sort");
  const sort: SearchSort = SORTS.includes(sortRaw as SearchSort) ? (sortRaw as SearchSort) : "relevance";
  const pageRaw = parseInt(get("page") ?? "1", 10);
  return {
    q: get("q"),
    category: get("category"),
    brands: getAll("brand"),
    priceBuckets: getAll("price"),
    ratings: getAll("rating"),
    discounts: getAll("discount"),
    genders: getAll("gender"),
    inStock: get("availability") === "in-stock",
    sort,
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}
