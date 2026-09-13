import type { Metadata } from "next";
import "./globals.css";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";

export const metadata: Metadata = {
  title: { default: "Kartora — Online Shopping for Mobiles, Fashion, Home & More", template: "%s | Kartora" },
  description: "Kartora is India's friendly online marketplace. Shop mobiles, electronics, fashion, home essentials and more with assured quality and fast delivery.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <MarketplaceHeader />
        <main className="flex-1">{children}</main>
        <footer className="mt-8 bg-[#172337] py-10 text-sm text-gray-300">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-4 md:grid-cols-4">
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">About</h3>
              <p>Kartora is a demo marketplace built as a full-stack engineering portfolio project. All products, brands and promotions are fictional.</p>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Your Account</h3>
              <ul className="space-y-2"><li>Orders</li><li>Wishlist</li><li>Cart</li></ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Help</h3>
              <ul className="space-y-2"><li>Payments</li><li>Shipping</li><li>Returns & Refunds</li></ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Policy</h3>
              <ul className="space-y-2"><li>Terms of Use</li><li>Privacy Policy</li><li>Security</li></ul>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-gray-500">© 2026 Kartora Demo Marketplace. Not affiliated with any real retailer.</p>
        </footer>
      </body>
    </html>
  );
}
