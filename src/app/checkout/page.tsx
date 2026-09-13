"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductVisual } from "@/components/product/product-visual";
import { computeTotals, useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useOrderStore } from "@/stores/order-store";
import { getProductById } from "@/lib/services/product-service";
import { formatPrice } from "@/lib/utils";
import type { AddressSnapshot, Order } from "@/types";

const addressSchema = z.object({
  name: z.string().min(3, "Enter full name"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile"),
  line1: z.string().min(6, "Enter house no, street"),
  city: z.string().min(2, "Enter city"),
  state: z.string().min(2, "Enter state"),
  pincode: z.string().regex(/^\d{6}$/, "Enter 6-digit pincode"),
});

const STEPS = ["Login", "Delivery Address", "Order Summary", "Payment"];

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const openLogin = useAuthStore((s) => s.openLogin);
  const { items, coupon, clear } = useCartStore();
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const [step, setStep] = useState(user ? 1 : 0);
  const [form, setForm] = useState<AddressSnapshot>({ name: user?.name ?? "", phone: user?.phone?.replace("+91", "") ?? "", line1: "", city: "", state: "", pincode: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paying, setPaying] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  const totals = computeTotals(items, coupon);

  const submitAddress = () => {
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setStep(2);
  };

  const pay = () => {
    setPaying(true);
    // TEST MODE: in production this creates a Razorpay order server-side,
    // opens checkout, and confirms only after webhook signature verification.
    setTimeout(() => {
      const snapshots = items.flatMap((it) => {
        const p = getProductById(it.productId);
        return p ? [{ productId: p.id, name: p.name, price: p.price, qty: it.qty, kind: p.visual.kind, hue: p.visual.hue }] : [];
      });
      const order = placeOrder(form, totals, snapshots);
      clear();
      setPaying(false);
      setPlaced(order);
    }, 1200);
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="flex flex-col items-center gap-3 rounded-sm bg-white p-10 text-center shadow-card">
          <CheckCircle2 className="h-14 w-14 text-success" />
          <h1 className="text-xl font-bold">Order placed successfully</h1>
          <p className="text-sm text-gray-600">Order number <strong>{placed.number}</strong> · {formatPrice(placed.totals.total)}</p>
          <div className="mt-3 flex gap-3">
            <Link href="/orders"><Button variant="outline">View Orders</Button></Link>
            <Link href="/"><Button>Continue Shopping</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-lg font-semibold">Nothing to checkout</p>
        <Link href="/" className="mt-2 inline-block text-sm font-semibold text-brand hover:underline">Browse products</Link>
      </div>
    );
  }

  const activeStep = user ? step : 0;

  return (
    <div className="mx-auto max-w-3xl px-3 py-4 md:px-4">
      <ol className="mb-4 flex items-center gap-1 overflow-x-auto rounded-sm bg-white px-4 py-3 text-xs font-semibold shadow-card">
        {STEPS.map((s, i) => (
          <li key={s} className={`flex items-center gap-1 whitespace-nowrap px-2 ${i === activeStep ? "text-brand" : i < activeStep ? "text-success" : "text-gray-400"}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${i === activeStep ? "bg-brand text-white" : i < activeStep ? "bg-success text-white" : "bg-gray-200"}`}>{i + 1}</span>
            {s}
            {i < STEPS.length - 1 && <span className="mx-1 text-gray-300">—</span>}
          </li>
        ))}
      </ol>

      {!user && (
        <div className="rounded-sm bg-white p-8 text-center shadow-card">
          <h1 className="text-lg font-bold">Login to continue</h1>
          <p className="mt-1 text-sm text-gray-500">Your cart and orders are linked to your account.</p>
          <Button className="mt-4" onClick={openLogin}>Login / Signup</Button>
        </div>
      )}

      {user && step === 1 && (
        <div className="rounded-sm bg-white p-5 shadow-card">
          <h1 className="mb-4 text-lg font-bold">Delivery Address</h1>
          <div className="grid gap-3 sm:grid-cols-2">
            {([["name", "Full Name"], ["phone", "Mobile Number"], ["line1", "Address (house no, street, area)"], ["city", "City"], ["state", "State"], ["pincode", "Pincode"]] as const).map(([key, label]) => (
              <div key={key} className={key === "line1" ? "sm:col-span-2" : ""}>
                <Label htmlFor={key}>{label}</Label>
                <Input id={key} className="mt-1" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                {errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]}</p>}
              </div>
            ))}
          </div>
          <Button className="mt-4" onClick={submitAddress}>Deliver Here</Button>
        </div>
      )}

      {user && step === 2 && (
        <div className="space-y-3">
          <div className="rounded-sm bg-white p-5 shadow-card">
            <div className="flex justify-between"><h1 className="text-lg font-bold">Order Summary</h1><button onClick={() => setStep(1)} className="text-xs font-semibold text-brand hover:underline">Change address</button></div>
            <p className="mt-1 text-sm text-gray-600">{form.name}, {form.line1}, {form.city}, {form.state} – {form.pincode} · {form.phone}</p>
            <ul className="mt-4 space-y-3">
              {items.map((it) => {
                const p = getProductById(it.productId);
                if (!p) return null;
                return (
                  <li key={it.productId} className="flex items-center gap-3">
                    <ProductVisual kind={p.visual.kind} hue={p.visual.hue} className="h-14 w-14 rounded-sm" />
                    <span className="flex-1 text-sm">{p.name} <span className="text-gray-500">× {it.qty}</span></span>
                    <span className="text-sm font-semibold">{formatPrice(p.price * it.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex justify-between border-t border-dashed border-gray-300 pt-3 text-base font-bold">
              <span>Total Payable</span><span>{formatPrice(totals.total)}</span>
            </div>
          </div>
          <Button className="w-full" onClick={() => setStep(3)}>Continue to Payment</Button>
        </div>
      )}

      {user && step === 3 && (
        <div className="rounded-sm bg-white p-6 text-center shadow-card">
          <h1 className="text-lg font-bold">Payment</h1>
          <p className="mt-1 text-sm text-gray-600">Pay <strong>{formatPrice(totals.total)}</strong> securely. Razorpay TEST MODE — no real money moves.</p>
          <p className="mx-auto mt-3 w-fit rounded-sm bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">Test gateway simulation · server-side verification enforced in production</p>
          <Button className="mt-5 w-full max-w-sm" onClick={pay} disabled={paying}>
            {paying ? "Processing payment…" : `Pay ${formatPrice(totals.total)}`}
          </Button>
          <button onClick={() => setStep(2)} className="mt-3 text-xs font-semibold text-brand hover:underline">Back</button>
        </div>
      )}
    </div>
  );
}
