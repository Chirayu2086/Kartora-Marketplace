# Kartora

A production-oriented full-stack Indian e-commerce marketplace built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma/PostgreSQL and Zustand. The UI follows a high-density marketplace design language (header + category nav + dense product grids + left filter sidebar + two-column login modal) with an original brand, original artwork (generated SVG product visuals) and fictional catalog data.

## Features
- Marketplace shell: sticky blue header, search with live suggestions, category navigation, cart badge
- Homepage: auto-playing hero carousel, promo cards with AD badges, five product rails
- Search: server-side text search, nested category/brand/price/rating/discount/gender/availability filters, 5 sort modes, pagination, mobile filter drawer
- Product page: gallery, variants (size/color), offers, seller info, specs, reviews, related rail, sticky mobile buy bar
- Cart: quantity controls, save-for-later, coupons (WELCOME10 / FEST200), price summary, localStorage persistence
- Checkout: 4-step flow (login → address with Zod validation → summary → Razorpay TEST-mode simulated payment) creating real order records
- Orders: history, status timeline, cancellation
- Wishlist: persistent, move-to-cart
- Auth: phone/email + OTP modal flow (demo OTP 123456), session persistence, role field ready for RBAC
- Database: normalized Prisma schema (users, addresses, categories, brands, products, variants, carts, wishlists, orders, payments, coupons, reviews, audit logs)

## Architecture
- `src/lib/services/product-service.ts` is the single catalog access point. It currently reads a deterministic in-repo demo catalog so the app runs with zero setup; swapping its internals for Prisma queries (schema provided) requires no UI changes.
- All filtering/sorting/pagination executes server-side in server components — the browser never receives the full catalog for the results page.
- Client state (cart, wishlist, session, orders) lives in Zustand stores with `persist` middleware.

## Local Development
```bash
npm install
npm run dev            # runs immediately with demo catalog
