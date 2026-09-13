"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProductVisual } from "./product-visual";
import type { CatalogProduct } from "@/types";

const HUE_OFFSETS = [0, 35, 90, 200];

export function ProductGallery({ product }: { product: CatalogProduct }) {
  const [active, setActive] = useState(0);
  const hue = (product.visual.hue + HUE_OFFSETS[active]) % 360;
  return (
    <div>
      <div className="rounded-sm border border-gray-200 bg-white p-4">
        <ProductVisual kind={product.visual.kind} hue={hue} className="aspect-square w-full" />
      </div>
      <div className="mt-2 flex gap-2">
        {HUE_OFFSETS.map((offset, i) => (
          <button
            key={offset}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            className={cn("w-14 overflow-hidden rounded-sm border-2", i === active ? "border-brand" : "border-gray-200 hover:border-gray-400")}
          >
            <ProductVisual kind={product.visual.kind} hue={(product.visual.hue + offset) % 360} className="aspect-square w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
