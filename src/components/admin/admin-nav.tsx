import Link from "next/link";
import { Archive, BarChart3, Coins, Package, ScrollText, Store, Users } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: Store },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Coins },
  { href: "/admin/audit", label: "Audit Logs", icon: Archive },
  { href: "/admin/audit", label: "", icon: ScrollText, hidden: true },
];

export function AdminNav({ current }: { current: string }) {
  return (
    <nav aria-label="Admin" className="scrollbar-hide flex gap-1 overflow-x-auto rounded-sm bg-white p-2 shadow-card lg:w-52 lg:shrink-0 lg:flex-col lg:self-start">
      {LINKS.filter((l) => !l.hidden).map((l) => (
        <Link
          key={l.href + l.label}
          href={l.href}
          aria-current={current === l.href ? "page" : undefined}
          className={`flex items-center gap-2 whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ${current === l.href ? "bg-brand text-white" : "text-gray-700 hover:bg-brand-light hover:text-brand"}`}
        >
          <l.icon className="h-4 w-4" />{l.label}
        </Link>
      ))}
      <Link href="/" className="flex items-center gap-2 whitespace-nowrap rounded-sm px-3 py-2 text-sm text-gray-500 hover:bg-gray-50">
        <Store className="h-4 w-4" />Back to store
      </Link>
    </nav>
  );
}
