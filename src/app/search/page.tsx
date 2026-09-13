import type { Metadata } from "next";
import Link from "next/link";
import { FilterDrawer, FilterSidebar } from "@/components/search/filter-sidebar";
import { ProductCard } from "@/components/product/product-card";
import { CATEGORIES } from "@/lib/data/catalog";
import { searchProducts } from "@/lib/services/product-service";
import { buildSearchHref, cn } from "@/lib/utils";
import { SORTS, SORT_LABELS, parseSearchParams } from "@/lib/validations/search";

export const metadata: Metadata = { title: "Search Results", robots: { index: false } };

type Raw = Record<string, string | string[]>;

export default async function SearchPage({ searchParams }: { searchParams: Promise<Raw> }) {
  const raw = await searchParams;
  const params = parseSearchParams(raw);
  const result = searchProducts(params);
  const start = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const end = Math.min(result.total, result.page * result.pageSize);
  const crumb = CATEGORIES.flatMap((c) => [c, ...(c.children ?? [])]).find((c) => c.slug === params.category);

  return (
    <div className="mx-auto flex max-w-[1440px] gap-3 px-3 py-3 md:px-4">
      <aside className="hidden w-[280px] shrink-0 self-start rounded-sm shadow-card lg:block">
        <FilterSidebar raw={raw} />
      </aside>

      <main className="min-w-0 flex-1">
        <nav aria-label="Breadcrumb" className="mb-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-brand">Home</Link>
          <span className="mx-1">›</span>
          <span className="text-gray-700">{crumb?.name ?? "All Products"}</span>
        </nav>

        <h1 className="mb-3 text-sm font-medium text-gray-800 md:text-base">
          Showing {start} – {end} of {result.total.toLocaleString("en-IN")} results
          {params.q && <> for <span className="font-bold">“{params.q}”</span></>}
        </h1>

        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-sm bg-white px-4 py-2.5 shadow-card md:gap-6">
          <FilterDrawer raw={raw} />
          <span className="hidden text-sm font-medium text-gray-600 md:inline">Sort By</span>
          <div className="scrollbar-hide flex flex-1 items-center gap-4 overflow-x-auto md:gap-6">
            {SORTS.map((s) => (
              <Link
                key={s}
                href={buildSearchHref(raw, { sort: s === "relevance" ? undefined : s, page: undefined })}
                className={cn(
                  "whitespace-nowrap border-b-2 pb-1 text-sm",
                  params.sort === s ? "border-brand font-semibold text-brand" : "border-transparent text-gray-800 hover:text-brand"
                )}
              >
                {SORT_LABELS[s]}
              </Link>
            ))}
          </div>
        </div>

        {result.items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-sm bg-white py-20 shadow-card">
            <p className="text-lg font-semibold">No products found</p>
            <p className="text-sm text-gray-500">Try removing some filters or searching for something else.</p>
            <Link href={buildSearchHref(raw, { category: undefined, brand: [], price: [], rating: [], discount: [], gender: [], availability: undefined })} className="text-sm font-semibold text-brand hover:underline">
              Clear all filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {result.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {result.totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-4 flex items-center justify-center gap-2">
            {result.page > 1 && (
              <Link href={buildSearchHref(raw, { page: String(result.page - 1) })} className="rounded-sm bg-white px-3 py-1.5 text-sm font-semibold text-brand shadow-card hover:bg-brand-light">Prev</Link>
            )}
            {Array.from({ length: result.totalPages }, (_, i) => i + 1)
              .filter((n) => Math.abs(n - result.page) <= 2 || n === 1 || n === result.totalPages)
              .map((n) => (
                <Link key={n} href={buildSearchHref(raw, { page: String(n) })} className={cn("rounded-sm px-3 py-1.5 text-sm shadow-card", n === result.page ? "bg-brand font-bold text-white" : "bg-white text-gray-800 hover:bg-brand-light")}>
                  {n}
                </Link>
              ))}
            {result.page < result.totalPages && (
              <Link href={buildSearchHref(raw, { page: String(result.page + 1) })} className="rounded-sm bg-white px-3 py-1.5 text-sm font-semibold text-brand shadow-card hover:bg-brand-light">Next</Link>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
