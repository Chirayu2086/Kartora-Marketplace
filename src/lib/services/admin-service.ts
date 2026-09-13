import { CATEGORIES, PRODUCTS } from "@/lib/data/catalog";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export interface AdminProductRow { id: string; name: string; slug: string; brand: string; category: string; price: number; mrp: number; stock: number; isActive: boolean; createdAt: string; }
export interface AdminOrderRow { id: string; number: string; customer: string; total: number; status: OrderStatus; createdAt: string; items: number; }
export interface AdminCustomerRow { id: string; name: string; email: string | null; phone: string | null; orders: number; joined: string; }
export interface AdminCouponRow { id: string; code: string; type: string; value: number; isActive: boolean; }
export interface AuditRow { id: string; actor: string; action: string; entity: string | null; createdAt: string; }
export interface OverviewData {
  mode: "postgres" | "demo";
  revenue: number; orders: number; customers: number; aov: number; lowStock: number;
  salesSeries: { label: string; revenue: number }[];
  categorySeries: { name: string; revenue: number }[];
  topProducts: { name: string; units: number }[];
}
export interface ProductInput { name: string; brand: string; category: string; price: number; mrp: number; stock: number; description?: string; }

/* ---------------- deterministic demo dataset (used when DATABASE_URL is absent) ---------------- */

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2026);
const CUSTOMER_NAMES = ["Rahul Sharma", "Ananya Mishra", "Vikram Rao", "Priya Sen", "Arjun Das", "Sneha Iyer", "Karan Mehta", "Divya Nair", "Rohan Gupta", "Meera Pillai", "Aditya Bose", "Ishita Roy"];
const ORDER_STATUSES: OrderStatus[] = ["DELIVERED", "DELIVERED", "SHIPPED", "CONFIRMED", "PROCESSING", "CANCELLED"];

const demoProducts: AdminProductRow[] = PRODUCTS.slice(0, 80).map((p) => ({
  id: p.id, name: p.name, slug: p.slug, brand: p.brand, category: p.categorySlug,
  price: p.price, mrp: p.mrp, stock: p.stock, isActive: true, createdAt: p.createdAt,
}));

const demoOrders: AdminOrderRow[] = Array.from({ length: 42 }, (_, i) => {
  const daysAgo = Math.floor(rand() * 14);
  return {
    id: `demo-order-${i}`,
    number: `OD${2600000 + i}`,
    customer: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
    total: 499 + Math.floor(rand() * 12000),
    status: ORDER_STATUSES[i % ORDER_STATUSES.length],
    createdAt: new Date(Date.now() - daysAgo * 86400000 - i * 3600000).toISOString(),
    items: 1 + Math.floor(rand() * 4),
  };
});

const demoCustomers: AdminCustomerRow[] = CUSTOMER_NAMES.map((name, i) => ({
  id: `demo-customer-${i}`,
  name,
  email: `${name.split(" ")[0].toLowerCase()}@example.com`,
  phone: `98765000${String(i).padStart(2, "0")}`,
  orders: 1 + Math.floor(rand() * 9),
  joined: new Date(Date.UTC(2025, Math.floor(rand() * 12), 1 + Math.floor(rand() * 27))).toISOString(),
}));

let demoCoupons: AdminCouponRow[] = [
  { id: "coupon-1", code: "WELCOME10", type: "PERCENTAGE", value: 10, isActive: true },
  { id: "coupon-2", code: "FEST200", type: "FIXED", value: 200, isActive: true },
  { id: "coupon-3", code: "MONSOON25", type: "PERCENTAGE", value: 25, isActive: false },
];

let demoAudit: AuditRow[] = [];
function audit(actor: string, action: string, entity: string | null) {
  demoAudit = [{ id: `audit-${demoAudit.length + 1}-${Date.now()}`, actor, action, entity, createdAt: new Date().toISOString() }, ...demoAudit];
}

function demoOverview(): OverviewData {
  const valid = demoOrders.filter((o) => o.status !== "CANCELLED");
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const salesSeries = Array.from({ length: 14 }, (_, d) => {
    const day = new Date(Date.now() - (13 - d) * 86400000);
    const label = day.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const dayRevenue = valid.filter((o) => new Date(o.createdAt).toDateString() === day.toDateString()).reduce((s, o) => s + o.total, 0);
    return { label, revenue: dayRevenue };
  });
  const catMap = new Map<string, number>();
  for (const o of valid) {
    const cat = CATEGORIES[o.items % CATEGORIES.length].name;
    catMap.set(cat, (catMap.get(cat) ?? 0) + o.total);
  }
  const categorySeries = [...catMap.entries()].map(([name, r]) => ({ name, revenue: r })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const topProducts = [...PRODUCTS].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5).map((p) => ({ name: p.name, units: Math.round(p.reviewCount / 40) }));
  return {
    mode: "demo",
    revenue, orders: demoOrders.length, customers: demoCustomers.length,
    aov: valid.length ? Math.round(revenue / valid.length) : 0,
    lowStock: demoProducts.filter((p) => p.stock < 10).length,
    salesSeries, categorySeries, topProducts,
  };
}

/* ---------------- public API (dual mode) ---------------- */

export async function getOverview(): Promise<OverviewData> {
  if (!prisma) return demoOverview();
  const since = new Date(Date.now() - 13 * 86400000);
  since.setHours(0, 0, 0, 0);
  const [orders, customers, lowStock] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: since } }, include: { items: { include: { product: { include: { category: true } } } } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.productVariant.count({ where: { stock: { lt: 10 } } }),
  ]);
  const valid = orders.filter((o) => o.status !== "CANCELLED");
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const salesSeries = Array.from({ length: 14 }, (_, d) => {
    const day = new Date(Date.now() - (13 - d) * 86400000);
    const label = day.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const dayRevenue = valid.filter((o) => new Date(o.createdAt).toDateString() === day.toDateString()).reduce((s, o) => s + o.total, 0);
    return { label, revenue: dayRevenue };
  });
  const catMap = new Map<string, number>();
  const unitMap = new Map<string, number>();
  for (const o of valid) for (const it of o.items) {
    const cat = it.product.category.name;
    catMap.set(cat, (catMap.get(cat) ?? 0) + it.price * it.quantity);
    unitMap.set(it.product.name, (unitMap.get(it.product.name) ?? 0) + it.quantity);
  }
  const categorySeries = [...catMap.entries()].map(([name, revenue2]) => ({ name, revenue: revenue2 })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const topProducts = [...unitMap.entries()].map(([name, units]) => ({ name, units })).sort((a, b) => b.units - a.units).slice(0, 5);
  return { mode: "postgres", revenue, orders: orders.length, customers, aov: valid.length ? Math.round(revenue / valid.length) : 0, lowStock, salesSeries, categorySeries, topProducts };
}

export async function listProducts(query: string, page: number): Promise<{ items: AdminProductRow[]; total: number }> {
  if (!prisma) {
    const q = query.toLowerCase();
    const filtered = demoProducts.filter((p) => p.isActive && (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)));
    const start = (page - 1) * 10;
    return { items: filtered.slice(start, start + 10), total: filtered.length };
  }
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, ...(query ? { name: { contains: query, mode: "insensitive" } } : {}) },
      include: { brand: true, category: true, variants: true },
      orderBy: { createdAt: "desc" }, skip: (page - 1) * 10, take: 10,
    }),
    prisma.product.count({ where: { isActive: true, ...(query ? { name: { contains: query, mode: "insensitive" } } : {}) } }),
  ]);
  return {
    total,
    items: rows.map((r) => ({
      id: r.id, name: r.name, slug: r.slug, brand: r.brand.name, category: r.category.slug,
      price: r.basePrice, mrp: r.mrp, stock: r.variants.reduce((s, v) => s + v.stock, 0),
      isActive: r.isActive, createdAt: r.createdAt.toISOString(),
    })),
  };
}

export async function createProduct(input: ProductInput, actor: string): Promise<void> {
  if (!prisma) {
    demoProducts.unshift({ id: `np-${Date.now()}`, name: input.name, slug: slugify(input.name), brand: input.brand, category: input.category, price: input.price, mrp: input.mrp, stock: input.stock, isActive: true, createdAt: new Date().toISOString() });
    audit(actor, "PRODUCT_CREATE", input.name);
    return;
  }
  await prisma.product.create({
    data: {
      name: input.name, slug: slugify(`${input.name}-${Date.now()}`), description: input.description,
      basePrice: input.price, mrp: input.mrp,
      brand: { connectOrCreate: { where: { slug: slugify(input.brand) }, create: { name: input.brand, slug: slugify(input.brand) } } },
      category: { connectOrCreate: { where: { slug: slugify(input.category) }, create: { name: input.category, slug: slugify(input.category) } } },
      variants: { create: { name: "Standard", sku: `${slugify(input.name)}-std`, price: input.price, mrp: input.mrp, stock: input.stock, attributes: {} } },
    },
  });
  await prisma.auditLog.create({ data: { action: "PRODUCT_CREATE", entity: "Product", entityId: input.name, userId: null, metadata: { actor } } });
}

export async function updateProduct(id: string, input: ProductInput, actor: string): Promise<void> {
  if (!prisma) {
    const idx = demoProducts.findIndex((p) => p.id === id);
    if (idx >= 0) demoProducts[idx] = { ...demoProducts[idx], ...input, category: input.category };
    audit(actor, "PRODUCT_UPDATE", input.name);
    return;
  }
  await prisma.$transaction([
    prisma.product.update({ where: { id }, data: { name: input.name, basePrice: input.price, mrp: input.mrp, description: input.description } }),
    prisma.productVariant.updateMany({ where: { productId: id }, data: { price: input.price, mrp: input.mrp, stock: input.stock } }),
  ]);
  await prisma.auditLog.create({ data: { action: "PRODUCT_UPDATE", entity: "Product", entityId: id, metadata: { actor } } });
}

export async function archiveProduct(id: string, actor: string): Promise<void> {
  if (!prisma) {
    const row = demoProducts.find((p) => p.id === id);
    if (row) row.isActive = false;
    audit(actor, "PRODUCT_ARCHIVE", row?.name ?? id);
    return;
  }
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  await prisma.auditLog.create({ data: { action: "PRODUCT_ARCHIVE", entity: "Product", entityId: id, metadata: { actor } } });
}

export async function listOrders(): Promise<AdminOrderRow[]> {
  if (!prisma) return [...demoOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const rows = await prisma.order.findMany({ include: { user: true, items: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return rows.map((r) => ({ id: r.id, number: r.orderNumber, customer: r.user.name ?? r.user.email ?? "Guest", total: r.total, status: r.status, createdAt: r.createdAt.toISOString(), items: r.items.length }));
}

export async function setOrderStatus(id: string, status: OrderStatus, actor: string): Promise<void> {
  if (!prisma) {
    const row = demoOrders.find((o) => o.id === id);
    if (row) row.status = status;
    audit(actor, "ORDER_STATUS", `${row?.number ?? id} → ${status}`);
    return;
  }
  await prisma.order.update({ where: { id }, data: { status } });
  await prisma.auditLog.create({ data: { action: "ORDER_STATUS", entity: "Order", entityId: id, metadata: { actor, status } } });
}

export async function listCustomers(): Promise<AdminCustomerRow[]> {
  if (!prisma) return demoCustomers;
  const rows = await prisma.user.findMany({ where: { role: "CUSTOMER" }, include: { _count: { select: { orders: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  return rows.map((r) => ({ id: r.id, name: r.name ?? "Guest", email: r.email, phone: r.phone, orders: r._count.orders, joined: r.createdAt.toISOString() }));
}

export async function listCoupons(): Promise<AdminCouponRow[]> {
  if (!prisma) return demoCoupons;
  const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((r) => ({ id: r.id, code: r.code, type: r.type, value: r.value, isActive: r.isActive }));
}

export async function createCoupon(code: string, type: "PERCENTAGE" | "FIXED", value: number, actor: string): Promise<void> {
  if (!prisma) {
    demoCoupons = [{ id: `coupon-${Date.now()}`, code, type, value, isActive: true }, ...demoCoupons];
    audit(actor, "COUPON_CREATE", code);
    return;
  }
  await prisma.coupon.create({ data: { code, type, value } });
  await prisma.auditLog.create({ data: { action: "COUPON_CREATE", entity: "Coupon", entityId: code, metadata: { actor } } });
}

export async function toggleCoupon(id: string, actor: string): Promise<void> {
  if (!prisma) {
    const row = demoCoupons.find((c) => c.id === id);
    if (row) row.isActive = !row.isActive;
    audit(actor, "COUPON_TOGGLE", row?.code ?? id);
    return;
  }
  const row = await prisma.coupon.findUnique({ where: { id } });
  if (row) await prisma.coupon.update({ where: { id }, data: { isActive: !row.isActive } });
  await prisma.auditLog.create({ data: { action: "COUPON_TOGGLE", entity: "Coupon", entityId: id, metadata: { actor } } });
}

export async function listAudit(): Promise<AuditRow[]> {
  if (!prisma) return demoAudit;
  const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return rows.map((r) => ({ id: r.id, actor: String((r.metadata as Record<string, unknown> | null)?.actor ?? "system"), action: r.action, entity: r.entityId, createdAt: r.createdAt.toISOString() }));
}
