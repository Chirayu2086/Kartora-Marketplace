"use client";

import { Heart, LogOut, MapPin, Package, Settings, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAddressStore } from "@/stores/address-store";
import { useAuthStore } from "@/stores/auth-store";
import { useOrderStore } from "@/stores/order-store";
import { useWishlistStore } from "@/stores/wishlist-store";

const addressSchema = z.object({
  name: z.string().min(3, "Enter full name"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile"),
  line1: z.string().min(6, "Enter house no, street"),
  city: z.string().min(2, "Enter city"),
  state: z.string().min(2, "Enter state"),
  pincode: z.string().regex(/^\d{6}$/, "Enter 6-digit pincode"),
});

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function AccountPage() {
  const [section, setSection] = useState<SectionId>("profile");
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const openLogin = useAuthStore((s) => s.openLogin);
  const orders = useOrderStore((s) => s.orders);
  const wishCount = useWishlistStore((s) => s.ids.length);
  const { addresses, save, remove, setDefault } = useAddressStore();
  const [form, setForm] = useState({ name: "", phone: "", line1: "", city: "", state: "", pincode: "", isDefault: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold">Your account</h1>
        <p className="mt-2 text-sm text-gray-500">Login to view your profile, orders, wishlist and addresses.</p>
        <Button className="mt-4" onClick={openLogin}>Login / Signup</Button>
      </div>
    );
  }

  const submitAddress = () => {
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    save({ ...parsed.data, isDefault: form.isDefault || addresses.length === 0 });
    setForm({ name: "", phone: "", line1: "", city: "", state: "", pincode: "", isDefault: false });
  };

  return (
    <div className="mx-auto grid max-w-[1200px] gap-3 px-3 py-4 md:grid-cols-[240px_1fr] md:px-4">
      <aside className="space-y-1 rounded-sm bg-white p-3 shadow-card md:sticky md:top-28 md:self-start">
        <div className="border-b border-gray-100 px-2 pb-3">
          <p className="text-sm font-bold">{user.name}</p>
          <p className="text-xs text-gray-500">{user.phone ?? user.email}</p>
          <span className={cn("mt-1 inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-bold", user.role === "ADMIN" ? "bg-brand-light text-brand" : "bg-gray-100 text-gray-600")}>
            {user.role}
          </span>
        </div>
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setSection(s.id)} className={cn("flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm font-medium", section === s.id ? "bg-brand-light text-brand" : "text-gray-700 hover:bg-gray-50")}>
            <s.icon className="h-4 w-4" />{s.label}
          </button>
        ))}
      </aside>

      <main className="rounded-sm bg-white p-5 shadow-card">
        {section === "profile" && (
          <div className="space-y-3">
            <h1 className="text-lg font-bold">Profile</h1>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs font-semibold uppercase text-gray-500">Full name</dt><dd className="mt-0.5">{user.name}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">Mobile</dt><dd className="mt-0.5">{user.phone ? `+91 ${user.phone}` : "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">Email</dt><dd className="mt-0.5">{user.email ?? "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-gray-500">Account type</dt><dd className="mt-0.5">{user.role}</dd></div>
            </dl>
            <p className="text-xs text-gray-500">Profile details are managed through your verified login identifier in this demo.</p>
          </div>
        )}

        {section === "orders" && (
          <div className="space-y-3">
            <h1 className="text-lg font-bold">Orders</h1>
            <p className="text-sm text-gray-600">You have {orders.length} order(s) in this session.</p>
            <Link href="/orders"><Button variant="outline" size="sm">View order history</Button></Link>
          </div>
        )}

        {section === "wishlist" && (
          <div className="space-y-3">
            <h1 className="text-lg font-bold">Wishlist</h1>
            <p className="text-sm text-gray-600">{wishCount} item(s) saved.</p>
            <Link href="/wishlist"><Button variant="outline" size="sm">Open wishlist</Button></Link>
          </div>
        )}

        {section === "addresses" && (
          <div className="space-y-4">
            <h1 className="text-lg font-bold">Addresses</h1>
            {addresses.length === 0 && <p className="text-sm text-gray-500">No saved addresses yet.</p>}
            <ul className="space-y-2">
              {addresses.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 rounded-sm border border-gray-200 p-3 text-sm">
                  <div>
                    <p className="font-semibold">{a.name} {a.isDefault && <span className="ml-1 rounded-sm bg-success/10 px-1.5 py-0.5 text-[10px] font-bold text-success">DEFAULT</span>}</p>
                    <p className="mt-0.5 text-gray-600">{a.line1}, {a.city}, {a.state} – {a.pincode} · {a.phone}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {!a.isDefault && <button onClick={() => setDefault(a.id)} className="text-xs font-semibold text-brand hover:underline">Set default</button>}
                    <button onClick={() => remove(a.id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="grid gap-3 rounded-sm bg-gray-50 p-4 sm:grid-cols-2">
              <h2 className="text-sm font-bold sm:col-span-2">Add new address</h2>
              {([["name", "Full name"], ["phone", "Mobile"], ["line1", "Address line"], ["city", "City"], ["state", "State"], ["pincode", "Pincode"]] as const).map(([key, label]) => (
                <div key={key} className={key === "line1" ? "sm:col-span-2" : ""}>
                  <Label htmlFor={`addr-${key}`}>{label}</Label>
                  <Input id={`addr-${key}`} className="mt-1" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                  {errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]}</p>}
                </div>
              ))}
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} className="h-3.5 w-3.5 accent-[#2563eb]" />
                Make this my default address
              </label>
              <div className="sm:col-span-2"><Button onClick={submitAddress}>Save Address</Button></div>
            </div>
          </div>
        )}

        {section === "settings" && (
          <div className="space-y-4">
            <h1 className="text-lg font-bold">Settings</h1>
            <p className="text-sm text-gray-600">Session: signed httpOnly cookie (demo auth). Cart, wishlist and addresses persist locally in this demo.</p>
            <Button variant="danger" size="sm" onClick={async () => { await logoutAction(); logout(); }}>
              <LogOut className="h-4 w-4" />Logout of this device
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
