"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCouponAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CouponForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await createCouponAction({ code, type, value: Number(value) });
    if (!res.ok) return setError(res.error);
    setCode(""); setValue("");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2 rounded-sm border border-gray-200 bg-gray-50 p-4">
      <div><label className="text-xs font-semibold text-gray-700" htmlFor="cp-code">Code</label><Input id="cp-code" className="mt-1 h-9 w-36" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="DIWALI15" required /></div>
      <div><label className="text-xs font-semibold text-gray-700" htmlFor="cp-type">Type</label>
        <select id="cp-type" className="mt-1 h-9 rounded-sm border border-gray-300 bg-white px-2 text-sm" value={type} onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED")}>
          <option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed ₹</option>
        </select>
      </div>
      <div><label className="text-xs font-semibold text-gray-700" htmlFor="cp-value">Value</label><Input id="cp-value" className="mt-1 h-9 w-24" type="number" min={1} value={value} onChange={(e) => setValue(e.target.value)} required /></div>
      <Button type="submit" size="sm">Create coupon</Button>
      {error && <p role="alert" className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
