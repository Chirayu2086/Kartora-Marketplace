"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AddressSnapshot, Order, Totals, OrderItemSnapshot } from "@/types";

interface OrderState {
  orders: Order[];
  placeOrder: (address: AddressSnapshot, totals: Totals, items: OrderItemSnapshot[]) => Order;
  cancelOrder: (id: string) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      placeOrder: (address, totals, items) => {
        const order: Order = {
          id: crypto.randomUUID(),
          number: `OD${Date.now().toString().slice(-10)}`,
          createdAt: new Date().toISOString(),
          status: "CONFIRMED",
          address,
          totals,
          items,
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },
      cancelOrder: (id) => set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status: "CANCELLED" } : o)) })),
    }),
    { name: "kartora-orders" }
  )
);
