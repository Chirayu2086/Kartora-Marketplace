"use client";

import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { getProductById } from "@/lib/services/product-service";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

export default function WishlistPage() {
  const { ids, remove } = useWishlistStore();
  const add = useCartStore((s) => s.add);
  const products = ids.map(getProductById).filter((p) => p !== undefined);

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="flex flex-col items-center gap-4 rounded-sm bg-white py-16 shadow-card">
          <Heart className="h-16 w-16 text-gray-300" />
          <p className="text-lg font-semibold">Your wishlist is empty</p>
          <p className="text-sm text-gray-500">Tap the heart on any product to save it here.</p>
          <Link href="/"><Button>Browse Products</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-3 py-4 md:px-4">
      <h1 className="mb-3 text-lg font-bold">My Wishlist ({products.length})</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            footer={
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                disabled={p.stock === 0}
                onClick={() => { add({ productId: p.id, qty: 1, size: p.sizes[0], color: p.colors[0] }); remove(p.id); }}
              >
                <ShoppingCart className="h-3.5 w-3.5" />Move to Cart
              </Button>
            }
          />
        ))}
      </div>
    </div>
  );
}
