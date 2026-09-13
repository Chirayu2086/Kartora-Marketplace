import { AdminNav } from "@/components/admin/admin-nav";
import { listCustomers } from "@/lib/services/admin-service";

export default async function AdminCustomersPage() {
  const customers = await listCustomers();
  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <AdminNav current="/admin/customers" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="rounded-sm bg-white px-4 py-3 shadow-card"><h1 className="text-lg font-bold">Customers ({customers.length})</h1></div>
        <div className="overflow-x-auto rounded-sm bg-white shadow-card">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2.5">Name</th><th className="px-4 py-2.5">Email</th><th className="px-4 py-2.5">Phone</th>
                <th className="px-4 py-2.5">Orders</th><th className="px-4 py-2.5">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium">{c.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{c.email ?? "—"}</td>
                  <td className="px-4 py-2.5 text-gray-600">{c.phone ?? "—"}</td>
                  <td className="px-4 py-2.5">{c.orders}</td>
                  <td className="px-4 py-2.5 text-gray-500">{new Date(c.joined).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
