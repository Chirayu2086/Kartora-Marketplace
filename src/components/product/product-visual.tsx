import type { ReactElement } from "react";
import type { VisualKind } from "@/types";

type ShapeFn = (m: string, a: string, b: string) => ReactElement;

const SHAPES: Record<VisualKind, ShapeFn> = {
  footwear: (m, a, b) => (
    <g>
      <path d="M12 66c0-14 10-20 24-23 12-3 18-9 24-14 5-4 10-3 14 1 5 5 14 8 14 16v12c0 6-5 10-12 10H22c-6 0-10-4-10-10z" fill={m} />
      <circle cx="42" cy="52" r="3" fill={b} /><circle cx="54" cy="48" r="3" fill={b} /><circle cx="66" cy="45" r="3" fill={b} />
      <path d="M12 70h76" stroke={a} strokeWidth="4" />
    </g>
  ),
  mobile: (m, a, b) => (
    <g><rect x="32" y="12" width="36" height="76" rx="6" fill={m} /><rect x="36" y="18" width="28" height="58" rx="2" fill={a} opacity=".35" /><circle cx="50" cy="82" r="3" fill={b} /></g>
  ),
  headphones: (m, a) => (
    <g><path d="M26 62v-8a24 24 0 0 1 48 0v8" stroke={m} strokeWidth="7" fill="none" /><rect x="20" y="58" width="12" height="22" rx="5" fill={m} /><rect x="68" y="58" width="12" height="22" rx="5" fill={m} /><rect x="23" y="62" width="6" height="14" rx="3" fill={a} /><rect x="71" y="62" width="6" height="14" rx="3" fill={a} /></g>
  ),
  tv: (m, a) => (
    <g><rect x="14" y="22" width="72" height="44" rx="4" fill={m} /><rect x="18" y="26" width="64" height="36" rx="2" fill={a} opacity=".4" /><rect x="42" y="66" width="16" height="8" fill={m} /><rect x="30" y="74" width="40" height="4" rx="2" fill={m} /></g>
  ),
  fashion: (m, a) => (
    <g><path d="M36 16l10-4c2 3 6 3 8 0l10 4 14 12-8 10-6-5v47H36V33l-6 5-8-10z" fill={m} /><path d="M46 12c2 3 6 3 8 0" stroke={a} strokeWidth="3" fill="none" /></g>
  ),
  beauty: (m, a, b) => (
    <g><rect x="40" y="34" width="20" height="46" rx="5" fill={m} /><rect x="45" y="22" width="10" height="12" fill={a} /><rect x="43" y="14" width="14" height="8" rx="2" fill={m} /><rect x="44" y="44" width="12" height="18" rx="2" fill={b} opacity=".8" /></g>
  ),
  home: (m, a) => (
    <g><path d="M28 44h44v26a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8z" fill={m} /><ellipse cx="50" cy="44" rx="22" ry="6" fill={a} /><rect x="46" y="30" width="8" height="8" rx="2" fill={m} /><path d="M20 52h8M72 52h8" stroke={m} strokeWidth="5" /></g>
  ),
  furniture: (m, a) => (
    <g><rect x="30" y="18" width="10" height="46" rx="3" fill={m} /><rect x="30" y="52" width="40" height="10" rx="3" fill={m} /><rect x="62" y="30" width="8" height="32" rx="3" fill={a} /><rect x="34" y="62" width="6" height="18" fill={m} /><rect x="60" y="62" width="6" height="18" fill={m} /></g>
  ),
  sports: (m, a, b) => (
    <g><circle cx="50" cy="50" r="26" fill={m} /><path d="M50 24v52M24 50h52" stroke={b} strokeWidth="3" fill="none" /><path d="M32 32c10 8 26 8 36 0M32 68c10-8 26-8 36 0" stroke={a} strokeWidth="3" fill="none" /></g>
  ),
  books: (m, a, b) => (
    <g><rect x="30" y="18" width="40" height="64" rx="3" fill={m} /><rect x="30" y="18" width="8" height="64" fill={a} /><rect x="44" y="30" width="20" height="4" rx="2" fill={b} /><rect x="44" y="40" width="16" height="3" rx="1.5" fill={b} opacity=".7" /></g>
  ),
  automotive: (m, a, b) => (
    <g><path d="M18 62c0-6 4-10 10-11l6-12c2-4 6-6 10-6h12c4 0 8 2 10 6l6 12c6 1 10 5 10 11v6H18z" fill={m} /><circle cx="34" cy="68" r="8" fill={b} /><circle cx="66" cy="68" r="8" fill={b} /><rect x="40" y="40" width="20" height="10" rx="2" fill={a} opacity=".6" /></g>
  ),
  toys: (m, a, b) => (
    <g><rect x="26" y="50" width="22" height="22" rx="3" fill={m} /><rect x="52" y="50" width="22" height="22" rx="3" fill={a} /><rect x="39" y="26" width="22" height="22" rx="3" fill={b} /><circle cx="50" cy="37" r="4" fill="#fff" /></g>
  ),
};

export function ProductVisual({ kind, hue, className }: { kind: VisualKind; hue: number; className?: string }) {
  const bg = `hsl(${hue} 70% 96%)`;
  const main = `hsl(${hue} 55% 42%)`;
  const accent = `hsl(${(hue + 40) % 360} 65% 55%)`;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <rect width="100" height="100" fill={bg} />
      {SHAPES[kind](main, accent, bg)}
    </svg>
  );
}
