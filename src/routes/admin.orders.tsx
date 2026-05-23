import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatZAR } from "@/lib/shopify";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["pending", "confirmed", "packed", "delivered", "cancelled"] as const;

function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () =>
      (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this order?")) return;
    await supabase.from("orders").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <p className="text-sm text-muted-foreground mt-1">{orders.length} total</p>

      <div className="mt-6 space-y-3">
        {orders.length === 0 && (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
            No orders yet.
          </div>
        )}
        {(orders as any[]).map((o) => (
          <div key={o.id} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="font-medium">{o.customer_name}</div>
                <div className="text-xs text-muted-foreground">{o.customer_phone} {o.customer_email ? `· ${o.customer_email}` : ""}</div>
                {o.customer_address && <div className="text-xs text-muted-foreground mt-0.5">{o.customer_address}</div>}
                {o.notes && <div className="text-xs italic text-muted-foreground mt-1">Note: {o.notes}</div>}
              </div>
              <div className="text-right">
                <div className="font-display text-xl">{formatZAR(o.total)}</div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
              </div>
            </div>
            <ul className="mt-3 text-sm space-y-1 border-t pt-3">
              {(o.items as any[]).map((it, i) => (
                <li key={i} className="flex justify-between">
                  <span>{it.name} × {it.quantity}</span>
                  <span className="text-muted-foreground">{formatZAR(it.line_total ?? it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2">
              <select
                value={o.status}
                onChange={(e) => setStatus(o.id, e.target.value)}
                className="h-9 rounded-lg border bg-background px-3 text-sm outline-none"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => remove(o.id)} className="ml-auto h-9 w-9 inline-flex items-center justify-center rounded text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
