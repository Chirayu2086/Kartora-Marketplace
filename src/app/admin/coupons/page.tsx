import { AdminNav } from "@/components/admin/admin-nav";
import { CouponForm } from "@/components/admin/coupon-form";
import { CouponToggle } from "@/components/admin/coupon-toggle";
import { listCoupons } from "@/lib/services/admin-service";

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();
  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <AdminNav current="/admin/coupons" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="rounded-sm bg-white px-4 py-3 shadow-card"><h1 className="text-lg font-bold">Coupons</h1></div>
        <CouponForm />
        <div className="overflow-x-auto rounded-sm bg-white shadow-card">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2.5">Code</th><th className="px-4 py-2.5">Type</th><th className="px-4 py-2.5">Value</th><th className="px-4 py-2.5">State</th><th className="px-4 py-2.5 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-bold">{c.code}</td>
                  <td className="px-4 py-2.5">{c.type}</td>
                  <td className="px-4 py-2.5">{c.type === "PERCENTAGE" ? `${c.value}%` : `₹${c.value}`}</td>
                  <td className="px-4 py-2.5"><span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold ${c.isActive ? "bg-success/10 text-success" : "bg-gray-100 text-gray-500"}`}>{c.isActive ? "ACTIVE" : "DISABLED"}</span></td>
                  <td className="px-4 py-2.5 text-right"><CouponToggle id={c.id} active={c.isActive} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
