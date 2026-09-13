"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductVisual } from "@/components/product/product-visual";
import { useOrderStore } from "@/stores/order-store";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: "CONFIRMED", label: "Placed" },
  { status: "PROCESSING", label: "Confirmed" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
];

function statusIndex(status: OrderStatus): number {
  switch (status) {
    case "CONFIRMED": return 0;
    case "PROCESSING": return 1;
    case "SHIPPED": case "OUT_FOR_DELIVERY": return 2;
    case "DELIVERED": return 3;
    default: return -1;
  }
}

export default function OrdersPage() {
  const { orders, cancelOrder } = useOrderStore();

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="flex flex-col items-center gap-4 rounded-sm bg-white py-16 shadow-card">
          <Package className="h-16 w-16 text-gray-300" />
          <p className="text-lg font-semibold">No orders yet</p>
          <Link href="/"><Button>Start Shopping</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-3 px-3 py-4 md:px-4">
      <h1 className="text-lg font-bold">My Orders ({orders.length})</h1>
      {orders.map((o) => {
        const idx = statusIndex(o.status);
        return (
          <article key={o.id} className="rounded-sm bg-white p-4 shadow-card">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <p className="text-sm font-bold">{o.number}</p>
                <p className="text-xs text-gray-500">Placed on {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {formatPrice(o.totals.total)}</p>
              </div>
              <span className={cn("rounded-sm px-2 py-1 text-xs font-bold", o.status === "CANCELLED" ? "bg-red-50 text-red-600" : "bg-success/10 text-success")}>
                {o.status === "CANCELLED" ? "CANCELLED" : idx === 3 ? "DELIVERED" : "IN PROGRESS"}
              </span>
            </header>

            {o.status !== "CANCELLED" && (
              <ol className="mt-3 flex items-center gap-1 text-[11px] font-semibold">
                {TIMELINE.map((t, i) => (
                  <li key={t.status} className={cn("flex items-center gap-1", i <= idx ? "text-success" : "text-gray-400")}>
                    <span className={cn("h-2 w-2 rounded-full", i <= idx ? "bg-success" : "bg-gray-300")} />
                    {t.label}
                    {i < TIMELINE.length - 1 && <span className="mx-1 h-px w-6 bg-gray-300" />}
                  </li>
                ))}
              </ol>
            )}

            <ul className="mt-3 space-y-2">
              {o.items.map((it) => (
                <li key={it.productId} className="flex items-center gap-3">
                  <ProductVisual kind={it.kind} hue={it.hue} className="h-12 w-12 rounded-sm" />
                  <Link href={`/product/${it.productId}`} className="flex-1 text-sm hover:text-brand">{it.name} <span className="text-gray-500">× {it.qty}</span></Link>
                  <span className="text-sm font-semibold">{formatPrice(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>

            <p className="mt-3 text-xs text-gray-500">Deliver to: {o.address.name}, {o.address.line1}, {o.address.city} – {o.address.pincode}</p>

            {(o.status === "CONFIRMED" || o.status === "PROCESSING") && (
              <Button variant="outline" size="sm" className="mt-3 text-red-600" onClick={() => cancelOrder(o.id)}>Cancel Order</Button>
            )}
          </article>
        );
      })}
    </div>
  );
}
