import { AdminNav } from "@/components/admin/admin-nav";
import { listAudit } from "@/lib/services/admin-service";

export default async function AdminAuditPage() {
  const logs = await listAudit();
  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <AdminNav current="/admin/audit" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="rounded-sm bg-white px-4 py-3 shadow-card"><h1 className="text-lg font-bold">Audit Logs</h1></div>
        <div className="rounded-sm bg-white p-4 shadow-card">
          {logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No admin actions recorded yet in this session. Create or edit a product to see entries appear.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {logs.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center gap-2 py-2">
                  <span className="rounded-sm bg-brand-light px-2 py-0.5 text-[10px] font-bold text-brand">{l.action}</span>
                  <span className="flex-1 truncate text-gray-700">{l.entity}</span>
                  <span className="text-xs text-gray-500">{l.actor}</span>
                  <span className="text-xs text-gray-400">{new Date(l.createdAt).toLocaleString("en-IN")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
