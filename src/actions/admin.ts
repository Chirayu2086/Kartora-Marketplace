"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import * as admin from "@/lib/services/admin-service";
import type { OrderStatus } from "@/types";

export type AdminResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

async function requireAdmin() {
  const session = await getSession();
  return session?.role === "ADMIN" ? session : null;
}

const productSchema = z.object({
  name: z.string().min(3, "Name too short"),
  brand: z.string().min(2, "Brand required"),
  category: z.string().min(2, "Category required"),
  price: z.number().int().positive("Price must be positive"),
  mrp: z.number().int().positive("MRP must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  description: z.string().max(2000).optional(),
});

export async function listProductsAction(query: string, page: number): Promise<AdminResult<{ items: admin.AdminProductRow[]; total: number }>> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };
  return { ok: true, data: await admin.listProducts(query, Math.max(1, page)) };
}

export async function createProductAction(input: z.input<typeof productSchema>): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Forbidden" };
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (parsed.data.mrp < parsed.data.price) return { ok: false, error: "MRP cannot be lower than selling price" };
  await admin.createProduct(parsed.data, session.name);
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateProductAction(id: string, input: z.input<typeof productSchema>): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Forbidden" };
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await admin.updateProduct(id, parsed.data, session.name);
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function archiveProductAction(id: string): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Forbidden" };
  await admin.archiveProduct(id, session.name);
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  return { ok: true };
}

const statusSchema = z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED"]);

export async function setOrderStatusAction(id: string, status: OrderStatus): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Forbidden" };
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid status" };
  await admin.setOrderStatus(id, parsed.data, session.name);
  revalidatePath("/admin/orders");
  return { ok: true };
}

const couponSchema = z.object({ code: z.string().min(3).max(20), type: z.enum(["PERCENTAGE", "FIXED"]), value: z.number().int().positive() });

export async function createCouponAction(input: z.input<typeof couponSchema>): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Forbidden" };
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (parsed.data.type === "PERCENTAGE" && parsed.data.value > 90) return { ok: false, error: "Percentage discount cannot exceed 90" };
  await admin.createCoupon(parsed.data.code.toUpperCase(), parsed.data.type, parsed.data.value, session.name);
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function toggleCouponAction(id: string): Promise<AdminResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Forbidden" };
  await admin.toggleCoupon(id, session.name);
  revalidatePath("/admin/coupons");
  return { ok: true };
}
