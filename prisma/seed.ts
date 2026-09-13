import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@kartora.example" },
    update: {},
    create: { email: "admin@kartora.example", name: "Kartora Admin", role: Role.ADMIN },
  });
  await prisma.user.upsert({
    where: { email: "customer@kartora.example" },
    update: {},
    create: { email: "customer@kartora.example", name: "Rahul Sharma", phone: "9876543210", role: Role.CUSTOMER },
  });

  const categories = [
    { name: "Footwear", slug: "footwear" }, { name: "Mobiles", slug: "mobiles" },
    { name: "Electronics", slug: "electronics" }, { name: "Fashion", slug: "fashion" },
    { name: "Beauty", slug: "beauty" }, { name: "Home & Kitchen", slug: "home-kitchen" },
    { name: "Furniture", slug: "furniture" }, { name: "Sports", slug: "sports" },
    { name: "Books", slug: "books" }, { name: "Automotive", slug: "automotive" },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  const footwear = await prisma.category.findUniqueOrThrow({ where: { slug: "footwear" } });
  for (const slug of ["mens-footwear", "womens-footwear", "kids-footwear"]) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: slug.replace("-", " ").replace(/\b\w/g, (m) => m.toUpperCase()), slug, parentId: footwear.id },
    });
  }

  for (const b of ["CROCS", "Nike", "Adidas", "Samsung", "Sony", "boAt", "Prestige", "Wakefit"]) {
    await prisma.brand.upsert({ where: { name: b }, update: {}, create: { name: b, slug: b.toLowerCase() } });
  }

  const crocs = await prisma.brand.findUniqueOrThrow({ where: { name: "CROCS" } });
  const mensFootwear = await prisma.category.findUniqueOrThrow({ where: { slug: "mens-footwear" } });
  const seeds = [
    { name: "CROCS Baya Clogs Classic Comfort Slip-On", slug: "crocs-baya-clogs-classic", price: 1729, mrp: 4495 },
    { name: "CROCS Lite Clogs Everyday White", slug: "crocs-lite-clogs-white", price: 1865, mrp: 2195 },
    { name: "CROCS Trail Clogs Adjustable Strap", slug: "crocs-trail-clogs-strap", price: 1509, mrp: 3495 },
  ];
  for (const s of seeds) {
    await prisma.product.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        name: s.name, slug: s.slug, brandId: crocs.id, categoryId: mensFootwear.id,
        basePrice: s.price, mrp: s.mrp, rating: 4.3, reviewCount: 5000, isAssured: true,
        description: "Lightweight comfort clogs with iconically designed ventilation.",
        variants: { create: [{ name: "Size 9", sku: `${s.slug}-9`, price: s.price, mrp: s.mrp, stock: 80, attributes: { size: "9" } }] },
      },
    });
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", type: "PERCENTAGE", value: 10, minOrder: 500, maxDiscount: 500 },
  });

  console.log("✅ Seed complete");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
