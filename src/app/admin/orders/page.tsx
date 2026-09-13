import { AdminNav } from "@/components/admin/admin-nav";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { listOrders } from "@/lib/services/admin-service";
import { formatPrice } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await listOrders();
  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <AdminNav current="/admin/orders" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="rounded-sm bg-white px-4 py-3 shadow-card"><h1 className="text-lg font-bold">Orders ({orders.length})</h1></div>
        <div className="overflow-x-auto rounded-sm bg-white shadow-card">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2.5">Order</th><th className="px-4 py-2.5">Customer</th><th className="px-4 py-2.5">Items</th>
                <th className="px-4 py-2.5">Total</th><th className="px-4 py-2.5">Placed</th><th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-semibold">{o.number}</td>
                  <td className="px-4 py-2.5">{o.customer}</td>
                  <td className="px-4 py-2.5">{o.items}</td>
                  <td className="px-4 py-2.5">{formatPrice(o.total)}</td>
                  <td className="px-4 py-2.5 text-gray-500">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                  <td className="px-4 py-2.5"><OrderStatusSelect orderId={o.id} status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
