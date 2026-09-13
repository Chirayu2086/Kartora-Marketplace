import Link from "next/link";
import { ProductCard } from "./product-card";
import type { CatalogProduct } from "@/types";

export function ProductRail({ title, href, products }: { title: string; href: string; products: CatalogProduct[] }) {
  if (products.length === 0) return null;
  return (
    <section className="rounded-sm bg-white p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 md:text-xl">{title}</h2>
        <Link href={href} className="rounded-sm bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">
          See All
        </Link>
      </div>
      <div className="scrollbar-hide -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {products.map((p) => (
          <div key={p.id} className="w-[190px] shrink-0 md:w-[210px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
