"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Heart, ShieldCheck, Star, Zap } from "lucide-react";
import { cn, calculateDiscount, formatPrice } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist-store";
import { ProductVisual } from "./product-visual";
import type { CatalogProduct } from "@/types";

export function ProductCard({ product, footer }: { product: CatalogProduct; footer?: ReactNode }) {
  const ids = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);
  const wished = ids.includes(product.id);
  const discount = calculateDiscount(product.mrp, product.price);
  const out = product.stock === 0;

  return (
    <div className={cn("group relative flex flex-col rounded-sm bg-white p-3 shadow-card transition-shadow hover:shadow-lift", out && "opacity-60")}>
      <button
        type="button"
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        onClick={() => toggle(product.id)}
        className="absolute right-2 top-2 z-10 rounded-full bg-white p-1.5 text-gray-400 shadow-card transition-colors hover:text-red-500"
      >
        <Heart className={cn("h-4 w-4 transition-transform", wished && "scale-110 fill-red-500 text-red-500")} />
      </button>
      <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-sm">
          {product.isSponsored && <span className="absolute left-0 top-0 z-10 text-[10px] text-gray-400">Sponsored</span>}
          <ProductVisual kind={product.visual.kind} hue={product.visual.hue} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{product.brand}</p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-brand">{product.name}</h3>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="flex items-center gap-0.5 rounded-sm bg-success px-1.5 py-0.5 text-[11px] font-bold text-white">
            {product.rating.toFixed(1)}<Star className="h-2.5 w-2.5 fill-white" />
          </span>
          <span className="text-xs text-gray-500">({product.reviewCount.toLocaleString("en-IN")})</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
          <span className="text-xs text-gray-400 line-through">{formatPrice(product.mrp)}</span>
          <span className="text-xs font-semibold text-success">{discount}% off</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {product.isAssured && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-brand"><ShieldCheck className="h-3.5 w-3.5" />Assured</span>
          )}
          {product.isHotDeal && (
            <span className="flex items-center gap-0.5 rounded-sm bg-success/10 px-1.5 py-0.5 text-[10px] font-bold text-success"><Zap className="h-2.5 w-2.5" />Hot Deal</span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-gray-500">{out ? "Out of stock" : product.price >= 500 ? "Free delivery" : "Delivery ₹40"}</p>
      </Link>
      {footer}
    </div>
  );
}
