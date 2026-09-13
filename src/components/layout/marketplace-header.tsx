"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Heart, LogOut, MapPin, Package, Search, ShoppingCart } from "lucide-react";
import { CATEGORIES } from "@/lib/data/catalog";
import { getSuggestions } from "@/lib/services/product-service";
import { buildSearchHref, debounce } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { LoginModal } from "@/components/auth/login-modal";

export function MarketplaceHeader() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const loginOpen = useAuthStore((s) => s.loginOpen);
  const openLogin = useAuthStore((s) => s.openLogin);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));

  const suggestions = useMemo(() => getSuggestions(q), [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowSuggest(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (term: string) => {
    setShowSuggest(false);
    router.push(buildSearchHref({}, { q: term || undefined }));
  };

  const onType = debounce((value: string) => setQ(value), 150);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-brand text-white">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-3 md:gap-6 md:px-4">
          <Link href="/" className="flex shrink-0 items-end gap-1" aria-label="Kartora home">
            <svg viewBox="0 0 64 64" className="h-8 w-8"><rect width="64" height="64" rx="12" fill="#fff" /><path d="M20 14v36M20 32l16-18M20 32l18 18" stroke="#2563eb" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" /><circle cx="46" cy="18" r="5" fill="#f4690c" /></svg>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold italic tracking-tight">Kartora</span>
              <span className="text-[10px] italic text-amber-300">Explore Plus ✦</span>
            </span>
          </Link>

          <div className="relative min-w-0 flex-1 md:max-w-2xl">
            <form onSubmit={(e) => { e.preventDefault(); submit(q); }} role="search">
              <label htmlFor="global-search" className="sr-only">Search products</label>
              <input
                id="global-search"
                type="search"
                placeholder="Search for products, brands and more"
                className="h-9 w-full rounded-sm bg-white pl-3 pr-10 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                onChange={(e) => { onType(e.target.value); setShowSuggest(e.target.value.length >= 2); }}
                onFocus={() => q.length >= 2 && setShowSuggest(true)}
              />
              <button type="submit" aria-label="Search" className="absolute right-0 top-0 flex h-9 w-10 items-center justify-center text-brand">
                <Search className="h-4 w-4" />
              </button>
            </form>
            {showSuggest && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
              <div className="absolute top-full z-50 w-full overflow-hidden rounded-b-sm bg-white py-2 text-gray-800 shadow-lift">
                {suggestions.categories.map((c) => (
                  <Link key={c.slug} href={buildSearchHref({}, { category: c.slug })} onClick={() => setShowSuggest(false)} className="flex items-center gap-2 px-4 py-1.5 text-sm hover:bg-brand-light">
                    <Search className="h-3.5 w-3.5 text-gray-400" />{c.name}<span className="ml-auto text-[10px] uppercase text-gray-400">category</span>
                  </Link>
                ))}
                {suggestions.products.map((p) => (
                  <Link key={p.slug} href={`/product/${p.slug}`} onClick={() => setShowSuggest(false)} className="flex items-center gap-2 px-4 py-1.5 text-sm hover:bg-brand-light">
                    <Search className="h-3.5 w-3.5 text-gray-400" />{p.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button className="hidden items-center gap-1 text-sm font-medium xl:flex">
            <MapPin className="h-4 w-4" />Delhi 110001
          </button>

          {user ? (
            <div className="relative">
              <button onClick={() => setAccountOpen((v) => !v)} className="flex items-center gap-1 rounded-sm bg-white px-4 py-1.5 text-sm font-semibold text-brand hover:bg-blue-50 md:px-8">
                {user.name.split(" ")[0]}<ChevronDown className="h-3 w-3" />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full z-50 w-48 overflow-hidden rounded-b-sm bg-white py-1 text-gray-800 shadow-lift">
                  <Link href="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-brand-light"><Package className="h-4 w-4" />My Orders</Link>
                  <Link href="/wishlist" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-brand-light"><Heart className="h-4 w-4" />Wishlist</Link>
                  <button onClick={() => { logout(); setAccountOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-brand-light"><LogOut className="h-4 w-4" />Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={openLogin} className="rounded-sm bg-white px-4 py-1.5 text-sm font-semibold text-brand hover:bg-blue-50 md:px-10">
              Login
            </button>
          )}

          <Link href="/wishlist" className="hidden items-center gap-1 text-sm font-medium md:flex">
            <Heart className="h-4 w-4" />Wishlist
          </Link>

          <Link href="/cart" className="relative flex items-center gap-2 text-sm font-medium">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden md:inline">Cart</span>
            {cartCount > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-cta px-1 text-[10px] font-bold">{cartCount}</span>}
          </Link>
        </div>
      </div>

      <nav aria-label="Categories" className="border-b border-gray-200 bg-white shadow-card">
        <div className="scrollbar-hide mx-auto flex h-11 max-w-[1440px] items-center gap-6 overflow-x-auto px-4 md:gap-8">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={buildSearchHref({}, { category: c.slug })} className="whitespace-nowrap text-sm font-semibold text-gray-800 hover:text-brand">
              {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {loginOpen && <LoginModal />}
    </header>
  );
}
