"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProductById } from "@/lib/services/product-service";
import type { CartItemState, Totals } from "@/types";

interface CartState {
  items: CartItemState[];
  coupon: string | null;
  add: (item: CartItemState) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  applyCoupon: (code: string) => boolean;
  clearCoupon: () => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: null,
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId && i.size === item.size && i.color === item.color);
          if (existing) {
            return { items: s.items.map((i) => (i === existing ? { ...i, qty: Math.min(10, i.qty + item.qty) } : i)) };
          }
          return { items: [...s.items, item] };
        }),
      setQty: (productId, qty) =>
        set((s) => ({ items: s.items.map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i)) })),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      applyCoupon: (code) => {
        const valid = code === "WELCOME10" || code === "FEST200";
        if (valid) set({ coupon: code });
        return valid;
      },
      clearCoupon: () => set({ coupon: null }),
      clear: () => set({ items: [], coupon: null }),
    }),
    { name: "kartora-cart" }
  )
);

export function computeTotals(items: CartItemState[], coupon: string | null): Totals {
  let mrpTotal = 0;
  let priceTotal = 0;
  for (const it of items) {
    const p = getProductById(it.productId);
    if (!p) continue;
    mrpTotal += p.mrp * it.qty;
    priceTotal += p.price * it.qty;
  }
  let couponDiscount = 0;
  if (coupon === "WELCOME10" && priceTotal >= 500) couponDiscount = Math.min(500, Math.round(priceTotal * 0.1));
  if (coupon === "FEST200" && priceTotal >= 999) couponDiscount = 200;
  const delivery = priceTotal === 0 || priceTotal >= 500 ? 0 : 40;
  const total = Math.max(0, priceTotal - couponDiscount) + delivery;
  return { mrpTotal, priceTotal, itemDiscount: mrpTotal - priceTotal, couponDiscount, delivery, total };
}
