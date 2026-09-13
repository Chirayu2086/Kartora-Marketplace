import Link from "next/link";
import { HeroCarousel, type HeroSlide } from "@/components/home/hero-carousel";
import { ProductRail } from "@/components/product/product-rail";
import { getRail } from "@/lib/services/product-service";
import { buildSearchHref } from "@/lib/utils";

const SLIDES: HeroSlide[] = [
  { id: "neo", title: "Neo X5 5G Launch", subtitle: "Pure Android 16 · From ₹13,999", cta: "Shop Now", href: buildSearchHref({}, { category: "mobiles" }), gradient: "from-blue-700 to-indigo-900", tag: "Launch 24 Sep" },
  { id: "home", title: "Summer Home Essentials", subtitle: "Cookware, flasks & appliances up to 60% off", cta: "Explore", href: buildSearchHref({}, { category: "home-kitchen" }), gradient: "from-orange-600 to-rose-700" },
  { id: "audio", title: "Premium Audio Week", subtitle: "Earbuds & headphones starting ₹999", cta: "Listen In", href: buildSearchHref({}, { category: "headphones" }), gradient: "from-purple-700 to-fuchsia-800" },
  { id: "fashion", title: "Fashion Festival", subtitle: "Min 50% off on top styles", cta: "Grab Deals", href: buildSearchHref({}, { category: "fashion" }), gradient: "from-teal-700 to-emerald-900" },
];

const PROMOS = [
  { title: "Beauty Picks", note: "Min 40% Off", hue: 330, href: buildSearchHref({}, { category: "beauty" }), ad: true },
  { title: "Sports Gear", note: "Up to 70% Off", hue: 210, href: buildSearchHref({}, { category: "sports" }), ad: false },
  { title: "Furniture Store", note: "From ₹2,999", hue: 25, href: buildSearchHref({}, { category: "furniture" }), ad: false },
  { title: "Book Corner", note: "Flat ₹100 Off", hue: 150, href: buildSearchHref({}, { category: "books" }), ad: true },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-4 px-3 py-4 md:px-4">
      <HeroCarousel slides={SLIDES} />

      <section aria-label="Promotions" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {PROMOS.map((p) => (
          <Link key={p.title} href={p.href} className="relative rounded-sm bg-white p-3 shadow-card transition-shadow hover:shadow-lift">
            {p.ad && <span className="absolute right-2 top-2 rounded-sm bg-gray-200 px-1.5 text-[9px] font-bold text-gray-600">AD</span>}
            <div className="mb-2 aspect-[4/3] overflow-hidden rounded-sm" style={{ background: `hsl(${p.hue} 70% 94%)` }}>
              <div className="flex h-full items-center justify-center text-3xl font-black" style={{ color: `hsl(${p.hue} 55% 45%)` }}>
                {p.title.charAt(0)}
              </div>
            </div>
            <h3 className="text-sm font-semibold">{p.title}</h3>
            <p className="text-xs font-semibold text-success">{p.note}</p>
          </Link>
        ))}
      </section>

      <ProductRail title="Trending Now" href={buildSearchHref({}, { sort: "popularity" })} products={getRail("trending")} />
      <ProductRail title="Best Deals" href={buildSearchHref({}, { discount: ["50"] })} products={getRail("deals")} />
      <ProductRail title="Top Fashion Picks" href={buildSearchHref({}, { category: "fashion" })} products={getRail("fashion")} />
      <ProductRail title="Electronics" href={buildSearchHref({}, { category: "electronics" })} products={getRail("electronics")} />
      <ProductRail title="Home Essentials" href={buildSearchHref({}, { category: "home-kitchen" })} products={getRail("home")} />
    </div>
  );
}
