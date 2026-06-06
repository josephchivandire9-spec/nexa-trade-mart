import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Package, CheckCircle2, Truck, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatZAR } from "@/lib/shopify";

export const Route = createFileRoute("/account/tracking")({
  head: () => ({ meta: [{ title: "Order Tracking — NEXA TRADE MART" }, { name: "robots", content: "noindex" }] }),
  component: TrackingPage,
});

const STEPS = [
  { key: "pending", label: "Received", Icon: Clock },
  { key: "processing", label: "Processing", Icon: Package },
  { key: "shipped", label: "Out for delivery", Icon: Truck },
  { key: "delivered", label: "Delivered", Icon: CheckCircle2 },
];

interface OrderRow { id: string; total: number; status: string; created_at: string }

function TrackingPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("id,total,status,created_at")
      .eq("customer_id", user.id).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { setOrders((data as OrderRow[]) ?? []); setLoading(false); });
  }, [user]);

  if (loading) return <Loader2 className="h-5 w-5 animate-spin" />;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-6">
        <h1 className="font-display text-2xl">Order Tracking</h1>
        <p className="text-sm text-muted-foreground">Live status of your recent orders.</p>
      </div>
      {orders.length === 0 && (
        <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">No orders yet.</div>
      )}
      {orders.map((o) => {
        const cancelled = o.status === "cancelled";
        const stepIdx = STEPS.findIndex((s) => s.key === o.status);
        return (
          <div key={o.id} className="rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 justify-between">
              <div>
                <div className="font-display text-base">Order #{o.id.slice(0, 8).toUpperCase()}</div>
                <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <div className="font-bold">{formatZAR(o.total)}</div>
            </div>
            {cancelled ? (
              <div className="mt-4 flex items-center gap-2 text-destructive"><XCircle className="h-4 w-4" /> Cancelled</div>
            ) : (
              <div className="mt-5 flex items-center justify-between">
                {STEPS.map((s, i) => {
                  const reached = i <= stepIdx;
                  return (
                    <div key={s.key} className="flex-1 flex flex-col items-center text-center">
                      <div className={`h-9 w-9 rounded-full inline-flex items-center justify-center ${reached ? "bg-gold text-ink" : "bg-muted text-muted-foreground"}`}>
                        <s.Icon className="h-4 w-4" />
                      </div>
                      <div className={`text-[11px] mt-1 ${reached ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{s.label}</div>
                      {i < STEPS.length - 1 && <div className={`h-0.5 w-full mt-3 -mb-3 ${i < stepIdx ? "bg-gold" : "bg-muted"}`} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
