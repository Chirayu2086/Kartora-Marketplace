"use client";

import { useNavigate } from "./nav-shim";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { CatalogProduct } from "@/types";

export function PurchasePanel({ product, layout = "panel" }: { product: CatalogProduct; layout?: "panel" | "bar" }) {
  const nav = useNavigate();
  const add = useCartStore((s) => s.add);
  const ids = useWishlistStore((s) => s.ids);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [added, setAdded] = useState(false);
  const wished = ids.includes(product.id);
  const out = product.stock === 0;

  const doAdd = () => {
    add({ productId: product.id, qty: 1, size, color });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const buyNow = () => {
    add({ productId: product.id, qty: 1, size, color });
    nav.push("/checkout");
  };

  if (layout === "bar") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-gray-200 bg-white p-3 lg:hidden">
        <Button variant="cta" className="flex-1" onClick={doAdd} disabled={out}>
          <ShoppingCart className="h-4 w-4" />{added ? "Added ✓" : "Add to Cart"}
        </Button>
        <Button className="flex-1 bg-cta-dark" onClick={buyNow} disabled={out}>
          <Zap className="h-4 w-4" />Buy Now
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {product.sizes.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase text-gray-600">Size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button key={s} onClick={() => setSize(s)} className={cn("min-w-10 rounded-sm border px-3 py-1.5 text-sm font-semibold", size === s ? "border-brand bg-brand-light text-brand" : "border-gray-300 hover:border-brand")}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {product.colors.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase text-gray-600">Color</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button key={c} onClick={() => setColor(c)} className={cn("rounded-sm border px-3 py-1.5 text-sm", color === c ? "border-brand bg-brand-light font-semibold text-brand" : "border-gray-300 hover:border-brand")}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3">
        <Button variant="cta" className="flex-1" onClick={doAdd} disabled={out}>
          <ShoppingCart className="h-4 w-4" />{added ? "Added ✓" : "Add to Cart"}
        </Button>
        <Button className="flex-1 bg-cta-dark hover:bg-cta" onClick={buyNow} disabled={out}>
          <Zap className="h-4 w-4" />Buy Now
        </Button>
        <button onClick={() => toggleWish(product.id)} aria-label="Toggle wishlist" className={cn("rounded-sm border px-3", wished ? "border-red-300 bg-red-50 text-red-500" : "border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500")}>
          <Heart className={cn("h-5 w-5", wished && "fill-red-500")} />
        </button>
      </div>
      {out && <p className="text-sm font-semibold text-red-600">Currently out of stock</p>}
    </div>
  );
}
