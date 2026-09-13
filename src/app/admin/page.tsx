import { AdminNav } from "@/components/admin/admin-nav";
import { SparkLine } from "@/components/admin/spark-line";
import { getOverview } from "@/lib/services/admin-service";
import { formatPrice } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const data = await getOverview();
  const maxCat = Math.max(...data.categorySeries.map((c) => c.revenue), 1);

  const cards = [
    { label: "Revenue (14d)", value: formatPrice(data.revenue) },
    { label: "Orders", value: String(data.orders) },
    { label: "Customers", value: String(data.customers) },
    { label: "Avg Order Value", value: formatPrice(data.aov) },
    { label: "Low-stock SKUs", value: String(data.lowStock) },
  ];

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <AdminNav current="/admin" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-center justify-between rounded-sm bg-white px-4 py-3 shadow-card">
          <h1 className="text-lg font-bold">Operations Overview</h1>
          <span className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase ${data.mode === "postgres" ? "bg-success/10 text-success" : "bg-amber-50 text-amber-700"}`}>
            {data.mode === "postgres" ? "PostgreSQL live" : "Demo dataset"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {cards.map((c) => (
            <div key={c.label} className="rounded-sm bg-white p-4 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{c.label}</p>
              <p className="mt-1 text-xl font-bold">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-sm bg-white p-4 shadow-card">
          <h2 className="mb-3 text-sm font-bold">Sales — last 14 days</h2>
          <SparkLine points={data.salesSeries} />
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>{data.salesSeries[0]?.label}</span><span>{data.salesSeries[data.salesSeries.length - 1]?.label}</span>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-sm bg-white p-4 shadow-card">
            <h2 className="mb-3 text-sm font-bold">Category performance</h2>
            <div className="space-y-3">
              {data.categorySeries.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-xs"><span className="font-medium">{c.name}</span><span className="text-gray-500">{formatPrice(c.revenue)}</span></div>
                  <div className="mt-1 h-2 rounded bg-gray-100"><div className="h-2 rounded bg-brand" style={{ width: `${(c.revenue / maxCat) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-sm bg-white p-4 shadow-card">
            <h2 className="mb-3 text-sm font-bold">Top products by units</h2>
            <ol className="space-y-2">
              {data.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-brand-light text-xs font-bold text-brand">{i + 1}</span>
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="font-semibold">{p.units}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
