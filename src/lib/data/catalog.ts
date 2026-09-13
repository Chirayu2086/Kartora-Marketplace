import type { CategoryNode, CatalogProduct, Review, VisualKind } from "@/types";
import { slugify } from "@/lib/utils";

/**
 * Deterministic demo catalog. Used when DATABASE_URL is not configured.
 * The service layer (lib/services) is the single access point, so swapping
 * this module for Prisma queries does not touch any UI component.
 */

export const CATEGORIES: CategoryNode[] = [
  { name: "Footwear", slug: "footwear", visual: "footwear", children: [
    { name: "Men's Footwear", slug: "mens-footwear", visual: "footwear" },
    { name: "Women's Footwear", slug: "womens-footwear", visual: "footwear" },
    { name: "Kids' Footwear", slug: "kids-footwear", visual: "footwear" },
  ]},
  { name: "Mobiles", slug: "mobiles", visual: "mobile" },
  { name: "Electronics", slug: "electronics", visual: "headphones", children: [
    { name: "Headphones", slug: "headphones", visual: "headphones" },
    { name: "Televisions", slug: "televisions", visual: "tv" },
  ]},
  { name: "Fashion", slug: "fashion", visual: "fashion", children: [
    { name: "Men's Fashion", slug: "mens-fashion", visual: "fashion" },
    { name: "Women's Fashion", slug: "womens-fashion", visual: "fashion" },
  ]},
  { name: "Beauty", slug: "beauty", visual: "beauty" },
  { name: "Home & Kitchen", slug: "home-kitchen", visual: "home" },
  { name: "Furniture", slug: "furniture", visual: "furniture" },
  { name: "Sports", slug: "sports", visual: "sports" },
  { name: "Books", slug: "books", visual: "books" },
  { name: "Automotive", slug: "automotive", visual: "automotive" },
  { name: "Toys & Baby", slug: "toys", visual: "toys" },
  { name: "Grocery", slug: "grocery", visual: "home" },
];

const LEAF_CONFIG: Record<string, { brands: string[]; models: string[]; min: number; max: number; gender?: "men" | "women" | "kids"; sizes: string[] }> = {
  "mens-footwear": { brands: ["CROCS", "Nike", "Adidas", "Puma", "Sparx"], models: ["Baya Clogs", "Lite Clogs", "Runner Slip-On", "Trail Clogs", "Urban Loafers", "Cloud Slides"], min: 1200, max: 4500, gender: "men", sizes: ["6","7","8","9","10","11"] },
  "womens-footwear": { brands: ["CROCS", "Nike", "Adidas", "Sparx"], models: ["Baya Clogs", "Grace Slides", "Flex Walk", "Aqua Clogs"], min: 1100, max: 3900, gender: "women", sizes: ["4","5","6","7","8"] },
  "kids-footwear": { brands: ["CROCS", "Sparx", "FunSkool"], models: ["Mini Clogs", "School Slip-On", "Play Slides"], min: 600, max: 1800, gender: "kids", sizes: ["10C","11C","12C","13C"] },
  mobiles: { brands: ["Samsung", "OnePlus", "Xiaomi", "Realme"], models: ["Neo X5 5G", "Aura Pro", "Pulse M40", "Edge Ultra", "Note 12 Pro"], min: 8000, max: 68000, sizes: [] },
  headphones: { brands: ["Sony", "boAt", "JBL"], models: ["Wireless Earbuds Pro", "Over-Ear Studio", "Neckband Flex", "ANC Headphones"], min: 999, max: 12000, sizes: [] },
  televisions: { brands: ["Samsung", "LG", "Sony"], models: ["4K Smart TV 43 inch", "QLED TV 55 inch", "HD Ready TV 32 inch"], min: 12000, max: 88000, sizes: [] },
  "mens-fashion": { brands: ["Roadster", "HRX", "Allen Solly"], models: ["Slim Fit Casual Shirt", "Cotton Kurta", "Printed T-Shirt", "Chino Pants"], min: 499, max: 2499, gender: "men", sizes: ["S","M","L","XL"] },
  "womens-fashion": { brands: ["Max", "Allen Solly", "Roadster"], models: ["Summer Dress", "A-Line Kurti", "Printed T-Shirt", "Wide-Leg Pants"], min: 499, max: 2999, gender: "women", sizes: ["XS","S","M","L"] },
  beauty: { brands: ["L'Oreal", "Maybelline", "Nivea"], models: ["Matte Lipstick", "Vitamin C Serum", "Face Wash Gel", "Sunscreen SPF50"], min: 199, max: 1499, sizes: [] },
  "home-kitchen": { brands: ["Prestige", "Hawkins", "Philips"], models: ["Non-Stick Cookset", "Induction Cooktop", "Vacuum Flask 1L", "Mixer Grinder 750W"], min: 499, max: 6999, sizes: [] },
  furniture: { brands: ["Wakefit", "Godrej Interio"], models: ["Ergonomic Office Chair", "Foldable Study Table", "3-Seater Sofa", "Queen Bed Frame"], min: 2999, max: 29999, sizes: [] },
  sports: { brands: ["Nivia", "Cosco", "Yonex"], models: ["Cricket Bat Kashmir Willow", "Football Size 5", "Badminton Racquet", "Yoga Mat Pro 6mm"], min: 299, max: 4999, sizes: [] },
  books: { brands: ["Penguin", "HarperCollins", "Rupa"], models: ["The Silent River (Paperback)", "Mindset Matters (Paperback)", "Courage Calls (Hardcover)"], min: 150, max: 899, sizes: [] },
  automotive: { brands: ["Bosch", "Michelin"], models: ["Car Washer Kit", "Street Helmet", "Wiper Blades Pair", "Engine Oil 5W30 1L"], min: 199, max: 4999, sizes: [] },
  toys: { brands: ["Lego", "FunSkool", "Hasbro"], models: ["Building Blocks 120 pc", "RC Stunt Car", "Plush Teddy Large", "Jigsaw Puzzle 500 pc"], min: 299, max: 4999, sizes: [] },
  grocery: { brands: ["Aashirvaad", "Tata", "Fortune"], models: ["Whole Wheat Atta 5kg", "Basmati Rice 1kg", "Sunflower Oil 1L", "Green Tea 100g"], min: 99, max: 999, sizes: [] },
};

const COLORS = ["Black", "White", "Blue", "Brown", "Beige", "Burgundy", "Green", "Grey"];
const EDITIONS = ["(Black)", "(Blue)", "Gen 2", "2025 Edition", "(Navy)", ""];

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const REVIEWERS = ["Ananya M.", "Rohit K.", "Priya S.", "Vikram R.", "Sneha T.", "Arjun D."];
const REVIEW_TITLES = ["Great value for money", "Good quality", "Looks premium", "Decent purchase", "Highly recommended"];
const REVIEW_BODIES = [
  "Been using it for three weeks now and it does exactly what it promises. Packaging was neat and delivery was on time.",
  "Quality is solid at this price point. Slight colour difference from photos but overall happy with the purchase.",
  "Works well for daily use. Would recommend waiting for a sale to grab the best price.",
  "Second one I am buying from this brand. Consistent quality and good finish.",
];

function makeReviews(rand: () => number): Review[] {
  return [0, 1, 2].map((i) => ({
    user: REVIEWERS[Math.floor(rand() * REVIEWERS.length)],
    rating: Math.max(3, Math.min(5, Math.round(3 + rand() * 2))),
    title: REVIEW_TITLES[Math.floor(rand() * REVIEW_TITLES.length)],
    comment: REVIEW_BODIES[Math.floor(rand() * REVIEW_BODIES.length)],
    date: new Date(Date.UTC(2025, Math.floor(rand() * 12), 1 + Math.floor(rand() * 27))).toISOString().slice(0, 10),
  }));
}

function buildCatalog(): CatalogProduct[] {
  const rand = mulberry32(20260913);
  const products: CatalogProduct[] = [];
  for (const parent of CATEGORIES) {
    const leaves = parent.children && parent.children.length > 0 ? parent.children : [parent];
    for (const leaf of leaves) {
      const cfg = LEAF_CONFIG[leaf.slug];
      if (!cfg) continue;
      for (let i = 0; i < 12; i++) {
        const brand = cfg.brands[Math.floor(rand() * cfg.brands.length)];
        const model = cfg.models[Math.floor(rand() * cfg.models.length)];
        const edition = EDITIONS[Math.floor(rand() * EDITIONS.length)];
        const name = `${brand} ${model} ${edition}`.replace(/\s+/g, " ").trim();
        const price = Math.round((cfg.min + rand() * (cfg.max - cfg.min)) / 5) * 5;
        const mrp = Math.round((price * (1.15 + rand() * 1.4)) / 5) * 5;
        const id = `${leaf.slug}-${i}`;
        products.push({
          id,
          slug: slugify(`${brand}-${model}-${edition}-${i}`),
          name,
          brand,
          categorySlug: leaf.slug,
          parentCategorySlug: parent.slug,
          gender: cfg.gender,
          price,
          mrp,
          rating: Math.round((3.4 + rand() * 1.4) * 10) / 10,
          reviewCount: Math.floor(20 + rand() * 24000),
          stock: rand() < 0.08 ? 0 : Math.floor(5 + rand() * 120),
          isSponsored: rand() < 0.12,
          isHotDeal: rand() < 0.18,
          isAssured: rand() < 0.6,
          colors: COLORS.slice(0, 2 + Math.floor(rand() * 3)),
          sizes: cfg.sizes,
          description: `${name} from ${brand}. Designed for everyday use with durable materials, a comfortable fit and a finish that holds up over time. Covered by a 1-year brand warranty and Flipkart's 7-day replacement promise.`,
          visual: { kind: leaf.visual, hue: Math.floor(rand() * 360) },
          createdAt: new Date(Date.UTC(2025, 0, 1) + Math.floor(rand() * 600) * 86400000).toISOString(),
          reviews: makeReviews(rand),
        });
      }
    }
  }
  return products;
}

export const PRODUCTS: CatalogProduct[] = buildCatalog();

export const TOP_BRANDS = ["CROCS", "Nike", "Adidas", "Samsung", "Sony", "boAt", "Prestige", "Wakefit", "L'Oreal", "Penguin"];
