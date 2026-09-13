"use client";

import { useRouter } from "next/navigation";
import { toggleCouponAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function CouponToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  return (
    <Button variant="outline" size="sm" onClick={async () => { await toggleCouponAction(id); router.refresh(); }}>
      {active ? "Disable" : "Enable"}
    </Button>
  );
}
