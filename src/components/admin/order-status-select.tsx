"use client";

import { useRouter } from "next/navigation";
import { setOrderStatusAction } from "@/actions/admin";
import type { OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED"];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  return (
    <select
      aria-label={`Status for order ${orderId}`}
      value={status}
      onChange={async (e) => {
        await setOrderStatusAction(orderId, e.target.value as OrderStatus);
        router.refresh();
      }}
      className="h-8 rounded-sm border border-gray-300 bg-white px-2 text-xs font-semibold focus:border-brand focus:outline-none"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
      ))}
    </select>
  );
}
