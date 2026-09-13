"use client";

import { useState } from "react";
import { createProductAction, updateProductAction, type AdminResult } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminProductRow } from "@/lib/services/admin-service";

const EMPTY = { name: "", brand: "", category: "", price: "", mrp: "", stock: "", description: "" };

export function ProductForm({ initial, onDone }: { initial?: AdminProductRow; onDone: () => void }) {
  const [form, setForm] = useState(
    initial
      ? { name: initial.name, brand: initial.brand, category: initial.category, price: String(initial.price), mrp: String(initial.mrp), stock: String(initial.stock), description: "" }
      : EMPTY
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      name: form.name, brand: form.brand, category: form.category,
      price: Number(form.price), mrp: Number(form.mrp), stock: Number(form.stock),
      description: form.description || undefined,
    };
    const res: AdminResult = initial ? await updateProductAction(initial.id, payload) : await createProductAction(payload);
    setSaving(false);
    if (!res.ok) return setError(res.error);
    onDone();
  };

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-sm border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
      <h3 className="text-sm font-bold sm:col-span-2">{initial ? `Edit: ${initial.name}` : "Create product"}</h3>
      <div className="sm:col-span-2"><Label htmlFor="pf-name">Name</Label><Input id="pf-name" className="mt-1" value={form.name} onChange={set("name")} required /></div>
      <div><Label htmlFor="pf-brand">Brand</Label><Input id="pf-brand" className="mt-1" value={form.brand} onChange={set("brand")} required /></div>
      <div><Label htmlFor="pf-category">Category slug</Label><Input id="pf-category" className="mt-1" value={form.category} onChange={set("category")} placeholder="mens-footwear" required /></div>
      <div><Label htmlFor="pf-price">Selling price (₹)</Label><Input id="pf-price" className="mt-1" type="number" min={1} value={form.price} onChange={set("price")} required /></div>
      <div><Label htmlFor="pf-mrp">MRP (₹)</Label><Input id="pf-mrp" className="mt-1" type="number" min={1} value={form.mrp} onChange={set("mrp")} required /></div>
      <div><Label htmlFor="pf-stock">Stock</Label><Input id="pf-stock" className="mt-1" type="number" min={0} value={form.stock} onChange={set("stock")} required /></div>
      {error && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : initial ? "Save changes" : "Create product"}</Button>
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}
