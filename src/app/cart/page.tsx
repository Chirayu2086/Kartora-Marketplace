"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductVisual } from "@/components/product/product-visual";
import { computeTotals, useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useAuthStore } from "@/stores/auth-store";
import { getProductById } from "@/lib/services/product-service";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { items, setQty, remove, coupon, applyCoupon, clearCoupon } = useCartStore();
  const addWish = useWishlistStore((s) => s.add);
  const user = useAuthStore((s) => s.user);
  const openLogin = useAuthStore((s) => s.openLogin);
  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const totals = computeTotals(items, coupon);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="flex flex-col items-center gap-4 rounded-sm bg-white py-16 shadow-card">
          <ShoppingCart className="h-16 w-16 text-gray-300" />
          <p className="text-lg font-semibold">Your cart is empty</p>
          <p className="text-sm text-gray-500">Add items to it now — deals are waiting.</p>
          <Link href="/"><Button>Shop Now</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1440px] gap-3 px-3 py-3 md:px-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        <div className="rounded-sm bg-white px-4 py-3 shadow-card">
          <h1 className="text-lg font-bold">My Cart ({items.length})</h1>
        </div>
        {items.map((item) => {
          const p = getProductById(item.productId);
          if (!p) return null;
          return (
            <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 rounded-sm bg-white p-4 shadow-card">
              <Link href={`/product/${p.slug}`} className="w-20 shrink-0 md:w-28">
                <ProductVisual kind={p.visual.kind} hue={p.visual.hue} className="aspect-square w-full rounded-sm" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${p.slug}`} className="line-clamp-2 text-sm font-medium hover:text-brand">{p.name}</Link>
                <p className="mt-0.5 text-xs text-gray-500">{[item.color, item.size && `Size ${item.size}`].filter(Boolean).join(" · ") || p.brand}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-base font-bold">{formatPrice(p.price * item.qty)}</span>
                  <span className="text-xs text-gray-400 line-through">{formatPrice(p.mrp * item.qty)}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(item.productId, item.qty - 1)} disabled={item.qty <= 1} aria-label="Decrease quantity" className="h-7 w-7 rounded-full border border-gray-300 text-sm font-bold disabled:opacity-40">−</button>
                    <span className="w-8 rounded-sm border border-gray-300 py-0.5 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => setQty(item.productId, item.qty + 1)} disabled={item.qty >= 10} aria-label="Increase quantity" className="h-7 w-7 rounded-full border border-gray-300 text-sm font-bold disabled:opacity-40">+</button>
                  </div>
                  <button onClick={() => { addWish(p.id); remove(p.id); }} className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
                    <Heart className="h-3.5 w-3.5" />Save for later
                  </button>
                  <button onClick={() => remove(p.id)} className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline">
                    <Trash2 className="h-3.5 w-3.5" />Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <aside className="space-y-3 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-sm bg-white p-4 shadow-card">
          <h2 className="mb-3 border-b border-gray-200 pb-2 text-sm font-bold uppercase text-gray-600">Price Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt>Price ({items.length} items)</dt><dd>{formatPrice(totals.mrpTotal)}</dd></div>
            <div className="flex justify-between text-success"><dt>Discount</dt><dd>− {formatPrice(totals.itemDiscount)}</dd></div>
            {totals.couponDiscount > 0 && <div className="flex justify-between text-success"><dt>Coupon ({coupon})</dt><dd>− {formatPrice(totals.couponDiscount)}</dd></div>}
            <div className="flex justify-between"><dt>Delivery</dt><dd>{totals.delivery === 0 ? <span className="text-success">FREE</span> : formatPrice(totals.delivery)}</dd></div>
            <div className="flex justify-between border-t border-dashed border-gray-300 pt-2 text-base font-bold"><dt>Total Payable</dt><dd>{formatPrice(totals.total)}</dd></div>
          </dl>
          <div className="mt-4">
            <label htmlFor="coupon" className="text-xs font-semibold text-gray-700">Apply coupon</label>
            <div className="mt-1 flex gap-2">
              <Input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="WELCOME10" className="h-9" />
              <Button size="sm" variant="outline" onClick={() => {
                if (!code) return;
                if (applyCoupon(code)) setCouponMsg("Coupon applied ✓");
                else setCouponMsg("Invalid or inapplicable coupon");
              }}>Apply</Button>
              {coupon && <button onClick={() => { clearCoupon(); setCouponMsg(""); }} className="text-xs font-semibold text-red-600">Remove</button>}
            </div>
            {couponMsg && <p className="mt-1 text-xs text-gray-600">{couponMsg}</p>}
          </div>
          <Button className="mt-4 w-full" onClick={() => (user ? router.push("/checkout") : openLogin())}>
            {user ? "Place Order" : "Login to Checkout"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
