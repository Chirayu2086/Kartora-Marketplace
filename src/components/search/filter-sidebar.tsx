"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, TOP_BRANDS } from "@/lib/data/catalog";
import { buildSearchHref, cn } from "@/lib/utils";
import { DISCOUNT_OPTIONS, GENDER_OPTIONS, PRICE_BUCKETS, RATING_OPTIONS, parseSearchParams } from "@/lib/validations/search";
import { Button } from "@/components/ui/button";

type Raw = Record<string, string | string[]>;
type MultiKey = "brand" | "price" | "rating" | "discount" | "gender";

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-200 px-4 py-3">
      <button onClick={onToggle} className="flex w-full items-center justify-between" aria-expanded={open}>
        <span className="text-xs font-bold uppercase tracking-wide text-gray-900">{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 hover:text-brand">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-3.5 w-3.5 accent-[#2563eb]" />
      {label}
    </label>
  );
}

export function FilterSidebar({ raw, hideHeader, onNavigate }: { raw: Raw; hideHeader?: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const p = parseSearchParams(raw);
  const [open, setOpen] = useState<Record<string, boolean>>({ categories: true, gender: true, brand: true, price: false, rating: false, discount: false, availability: false });
  const toggle = (k: string) => setOpen((s) => ({ ...s, [k]: !s[k] }));
  const push = (patch: Record<string, string | string[] | undefined>) => {
    router.push(buildSearchHref(raw, patch));
    onNavigate?.();
  };
  const toggleMulti = (key: MultiKey, value: string, current: string[]) =>
    push({ [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value], page: undefined });

  return (
    <div className="bg-white">
      {!hideHeader && (
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-bold">Filters</h2>
          <button onClick={() => push({ category: undefined, brand: [], price: [], rating: [], discount: [], gender: [], availability: undefined, page: undefined })} className="text-xs font-semibold text-brand hover:underline">
            CLEAR ALL
          </button>
        </div>
      )}

      <Section title="Categories" open={open.categories} onToggle={() => toggle("categories")}>
        {CATEGORIES.map((c) => (
          <div key={c.slug}>
            <Check label={c.name} checked={p.category === c.slug} onChange={() => push({ category: p.category === c.slug ? undefined : c.slug, page: undefined })} />
            {c.children?.map((child) => (
              <div key={child.slug} className="ml-5 mt-1.5">
                <Check label={child.name} checked={p.category === child.slug} onChange={() => push({ category: p.category === child.slug ? undefined : child.slug, page: undefined })} />
              </div>
            ))}
          </div>
        ))}
      </Section>

      <Section title="Gender" open={open.gender} onToggle={() => toggle("gender")}>
        {GENDER_OPTIONS.map((g) => (
          <Check key={g.id} label={g.label} checked={p.genders.includes(g.id)} onChange={() => toggleMulti("gender", g.id, p.genders)} />
        ))}
      </Section>

      <Section title="Brand" open={open.brand} onToggle={() => toggle("brand")}>
        {TOP_BRANDS.map((b) => (
          <Check key={b} label={b} checked={p.brands.includes(b)} onChange={() => toggleMulti("brand", b, p.brands)} />
        ))}
      </Section>

      <Section title="Price" open={open.price} onToggle={() => toggle("price")}>
        {PRICE_BUCKETS.map((b) => (
          <Check key={b.id} label={b.label} checked={p.priceBuckets.includes(b.id)} onChange={() => toggleMulti("price", b.id, p.priceBuckets)} />
        ))}
      </Section>

      <Section title="Customer Rating" open={open.rating} onToggle={() => toggle("rating")}>
        {RATING_OPTIONS.map((r) => (
          <Check key={r} label={`${r}★ & above`} checked={p.ratings.includes(r)} onChange={() => toggleMulti("rating", r, p.ratings)} />
        ))}
      </Section>

      <Section title="Discount" open={open.discount} onToggle={() => toggle("discount")}>
        {DISCOUNT_OPTIONS.map((d) => (
          <Check key={d} label={`${d}% or more`} checked={p.discounts.includes(d)} onChange={() => toggleMulti("discount", d, p.discounts)} />
        ))}
      </Section>

      <Section title="Availability" open={open.availability} onToggle={() => toggle("availability")}>
        <Check label="In Stock" checked={p.inStock} onChange={() => push({ availability: p.inStock ? undefined : "in-stock", page: undefined })} />
      </Section>
    </div>
  );
}

export function FilterDrawer({ raw }: { raw: Raw }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="h-4 w-4" />Filter
      </Button>
      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] overflow-y-auto bg-white">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
              <span className="text-base font-bold">Filters</span>
              <button onClick={() => setOpen(false)} aria-label="Close filters"><X className="h-5 w-5" /></button>
            </div>
            <FilterSidebar raw={raw} hideHeader onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
