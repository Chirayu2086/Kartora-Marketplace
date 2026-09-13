import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role !== "ADMIN") redirect("/");
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-3 py-4 md:px-4 lg:flex-row">
      <AdminNav current="" />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
