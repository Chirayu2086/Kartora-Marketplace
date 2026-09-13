"use client";

import { Package, Pencil, Plus, Archive } from "lucide-react";
import { useEffect, useState } from "react";
import { archiveProductAction, listProductsAction } from "@/actions/admin";
import { AdminNav } from "@/components/admin/admin-nav";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminProductRow } from "@/lib/services/admin-service";
import { formatPrice } from "@/lib/utils";

export default function AdminProductsPage() {
  const [rows, setRows] = useState<AdminProductRow[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminProductRow | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async (q: string, p: number) => {
    const res = await listProductsAction(q, p);
    if (res.ok && res.data) {
      setRows(res.data.items);
      setTotal(res.data.total);
    }
  };

  useEffect(() => {
    load(query, page);
  }, [query, page]);

  const done = () => {
    setCreating(false);
    setEditing(null);
    load(query, page);
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <AdminNav current="/admin/products" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm bg-white px-4 py-3 shadow-card">
          <h1 className="text-lg font-bold">Products ({total})</h1>
          <div className="flex gap-2">
            <Input placeholder="Search name…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="h-9 w-44" />
            <Button size="sm" onClick={() => { setCreating((v) => !v); setEditing(null); }}><Plus className="h-4 w-4" />New</Button>
          </div>
        </div>

        {(creating || editing) && <ProductForm initial={editing ?? undefined} onDone={done} />}

        <div className="overflow-x-auto rounded-sm bg-white shadow-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2.5">Product</th><th className="px-4 py-2.5">Brand</th><th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Price</th><th className="px-4 py-2.5">Stock</th><th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="max-w-[260px] truncate px-4 py-2.5 font-medium">{r.name}</td>
                  <td className="px-4 py-2.5">{r.brand}</td>
                  <td className="px-4 py-2.5 text-gray-500">{r.category}</td>
                  <td className="px-4 py-2.5">{formatPrice(r.price)}</td>
                  <td className="px-4 py-2.5"><span className={r.stock < 10 ? "font-bold text-red-600" : ""}>{r.stock}</span></td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button aria-label={`Edit ${r.name}`} onClick={() => { setEditing(r); setCreating(false); }} className="rounded-sm p-1.5 text-gray-500 hover:bg-brand-light hover:text-brand"><Pencil className="h-4 w-4" /></button>
                      <button aria-label={`Archive ${r.name}`} onClick={async () => { await archiveProductAction(r.id); load(query, page); }} className="rounded-sm p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"><Archive className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500"><Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />No products match.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="text-gray-500">Page {page} of {Math.max(1, Math.ceil(total / 10))}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 10)} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
