import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductRail } from "@/components/product/product-rail";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { CATEGORIES } from "@/lib/data/catalog";
import { getProduct, getRelated } from "@/lib/services/product-service";
import { buildSearchHref, calculateDiscount, formatPrice } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} – Price, Reviews & Offers`,
    description: product.description,
    openGraph: { title: product.name, description: product.description },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const category = CATEGORIES.flatMap((c) => [c, ...(c.children ?? [])]).find((c) => c.slug === product.categorySlug);
  const deliveryBy = new Date(Date.now() + 3 * 86400000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="mx-auto max-w-[1440px] px-3 py-3 md:px-4">
      <nav aria-label="Breadcrumb" className="mb-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-brand">Home</Link><span className="mx-1">›</span>
        <Link href={buildSearchHref({}, { category: product.parentCategorySlug })} className="hover:text-brand">{category?.name ?? product.parentCategorySlug}</Link><span className="mx-1">›</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid gap-4 rounded-sm bg-white p-4 shadow-card lg:grid-cols-[380px_1fr] lg:gap-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductGallery product={product} />
          <div className="mt-4 hidden lg:block"><PurchasePanel product={product} /></div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{product.brand}</p>
          <h1 className="mt-1 text-xl font-semibold md:text-2xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-sm bg-success px-2 py-0.5 text-xs font-bold text-white">{product.rating.toFixed(1)}<Star className="h-3 w-3 fill-white" /></span>
            <span className="text-sm text-gray-500">{product.reviewCount.toLocaleString("en-IN")} ratings</span>
            {product.isAssured && <span className="flex items-center gap-1 text-xs font-bold text-brand"><ShieldCheck className="h-4 w-4" />Assured</span>}
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            <span className="text-base text-gray-400 line-through">{formatPrice(product.mrp)}</span>
            <span className="text-base font-bold text-success">{calculateDiscount(product.mrp, product.price)}% off</span>
          </div>

          <section className="mt-4">
            <h2 className="mb-2 text-sm font-bold uppercase text-gray-600">Available Offers</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              <li><strong>Bank Offer:</strong> 10% instant discount on Flipkart Pay Credit Cards, up to ₹1,500</li>
              <li><strong>Special Price:</strong> Extra {calculateDiscount(product.mrp, product.price)}% off (price inclusive of discount)</li>
              <li><strong>Coupon:</strong> Apply WELCOME10 for 10% off (max ₹500) on your first order</li>
            </ul>
          </section>

          <section className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
            <p className="flex items-center gap-2 text-gray-700"><Truck className="h-4 w-4 text-brand" />Free delivery by {deliveryBy}</p>
            <p className="flex items-center gap-2 text-gray-700"><RotateCcw className="h-4 w-4 text-brand" />7-day replacement</p>
            <p className="flex items-center gap-2 text-gray-700"><ShieldCheck className="h-4 w-4 text-brand" />1-year warranty</p>
          </section>

          <p className="mt-4 flex items-center gap-1.5 text-sm text-gray-700">
            Seller: <span className="font-semibold text-brand">Flipkart Retail Pvt Ltd</span><BadgeCheck className="h-4 w-4 text-brand" />
          </p>

          <div className="mt-6 lg:hidden"><PurchasePanel product={product} /></div>

          <section className="mt-6">
            <h2 className="mb-2 text-sm font-bold uppercase text-gray-600">Product Details</h2>
            <p className="text-sm leading-relaxed text-gray-700">{product.description}</p>
            <table className="mt-3 w-full max-w-xl text-sm">
              <tbody>
                {[["Brand", product.brand], ["Category", category?.name ?? product.categorySlug], ["Colors", product.colors.join(", ") || "—"], ["Sizes", product.sizes.join(", ") || "—"], ["Stock", product.stock === 0 ? "Out of stock" : `${product.stock} units`], ["Warranty", "1 year brand warranty"]].map(([k, v]) => (
                  <tr key={k} className="border-b border-gray-100">
                    <td className="w-32 py-2 pr-4 font-semibold text-gray-500">{k}</td>
                    <td className="py-2 text-gray-800">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-bold uppercase text-gray-600">Ratings & Reviews</h2>
            <div className="space-y-4">
              {product.reviews.map((r, i) => (
                <article key={i} className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-sm bg-success px-1.5 py-0.5 text-[11px] font-bold text-white">{r.rating}<Star className="h-2.5 w-2.5 fill-white" /></span>
                    <span className="text-sm font-semibold">{r.title}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{r.comment}</p>
                  <p className="mt-1 text-xs text-gray-500">{r.user} · Certified Buyer · {r.date}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="mt-4">
        <ProductRail title="Similar Products" href={buildSearchHref({}, { category: product.categorySlug })} products={getRelated(product)} />
      </div>
      <PurchasePanel product={product} layout="bar" />
      <div className="h-16 lg:hidden" />
    </div>
  );
}
